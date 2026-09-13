import "dotenv/config";
import crypto from "crypto";
import express from "express";
import { createClient } from "@supabase/supabase-js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
const PYTHON_SERVICE_URL = "http://localhost:8001";

const PAYMONGO_API = "https://api.paymongo.com/v1";
const paymongoSecretKey = process.env.PAYMONGO_SECRET_KEY;

const RESEND_API = "https://api.resend.com/emails";
const resendApiKey = process.env.RESEND_API_KEY;

function paymongoAuthHeader(): string {
  return "Basic " + Buffer.from(`${paymongoSecretKey}:`).toString("base64");
}

function supabaseAdmin() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey);
}

// Verifies the Paymongo-Signature header. Algorithm taken directly from
// PayMongo's official Node SDK (paymongo-node's WebhookService.constructEvent):
// header is "t=<timestamp>,te=<test_signature>,li=<live_signature>", and the
// expected signature is HMAC-SHA256(webhookSecret, `${timestamp}.${rawBody}`).
function verifyPaymongoSignature(rawBody: string, signatureHeader: string, webhookSecret: string): boolean {
  const parts = signatureHeader.split(",");
  if (parts.length < 3) return false;

  const timestamp = parts[0].split("=")[1];
  const testModeSignature = parts[1].split("=")[1];
  const liveModeSignature = parts[2].split("=")[1];
  const expectedSignature = testModeSignature || liveModeSignature;

  const hmac = crypto.createHmac("sha256", webhookSecret).update(`${timestamp}.${rawBody}`).digest("hex");
  return hmac === expectedSignature;
}

// Supabase's PostgrestError (and some other thrown objects) carry a
// `.message` but aren't `instanceof Error`, so a plain instanceof check was
// silently swallowing real error text behind generic fallback messages.
function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return fallback;
}

function formatAddress(address: { line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country?: string } | null | undefined): string {
  if (!address) return "";
  return [address.line1, address.line2, address.city, address.state, address.postal_code, address.country].filter(Boolean).join(", ");
}

const app = express();

// PayMongo webhook signatures are verified over the RAW request body, so this
// route (with its own express.raw parser) must be registered BEFORE the
// global express.json() middleware below — otherwise json() would consume
// the body first and signature verification would always fail.
app.post("/api/paymongo-webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (!webhookSecret) {
    res.status(500).send("PAYMONGO_WEBHOOK_SECRET is not set.");
    return;
  }

  const signatureHeader = req.headers["paymongo-signature"] as string | undefined;
  const rawBody = (req.body as Buffer).toString("utf8");

  if (!signatureHeader || !verifyPaymongoSignature(rawBody, signatureHeader, webhookSecret)) {
    res.status(400).send("Invalid signature.");
    return;
  }

  const event = JSON.parse(rawBody);
  const eventType = event.data?.attributes?.type;

  if (eventType === "checkout_session.payment.paid") {
    const checkoutSession = event.data.attributes.data;
    const orderId = checkoutSession?.attributes?.reference_number;
    const billing = checkoutSession?.attributes?.billing;
    const adminClient = supabaseAdmin();

    if (orderId && adminClient) {
      // Our own checkout form already saved real customer/shipping details
      // on the order at creation time — only fall back to PayMongo's billing
      // data here if it's actually present, so we never clobber good data
      // with blanks (billing.address in particular is often absent).
      const update: Record<string, unknown> = { status: "paid", updated_at: new Date().toISOString() };
      if (billing?.email) update.customer_email = billing.email;
      if (billing?.name) update.customer_name = billing.name;
      const formattedAddress = formatAddress(billing?.address);
      if (formattedAddress) update.shipping_address = formattedAddress;

      await adminClient.from("orders").update(update).eq("id", orderId);
    }
  }

  res.json({ received: true });
});

app.use(express.json({ limit: "15mb" }));

app.post("/api/generate-product-image", async (req, res) => {
  const { prompt, baseImage } = req.body as {
    prompt?: string;
    baseImage?: { data?: string; mimeType?: string };
  };

  if (!prompt || !baseImage?.data) {
    res.status(400).json({ error: "Request must include a prompt and a baseImage { data, mimeType }." });
    return;
  }

  try {
    const pyResponse = await fetch(`${PYTHON_SERVICE_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, image_base64: baseImage.data }),
    });

    const json = await pyResponse.json();
    if (!pyResponse.ok) {
      res.status(502).json({ error: json.error ?? "The local AI image service returned an error." });
      return;
    }

    res.json({ imageDataUrl: json.imageDataUrl });
  } catch (err) {
    const message = errorMessage(err, "Unknown error.");
    res.status(502).json({
      error: `Could not reach the local AI image service on port 8001 (${message}). Make sure \`npm run ai-service\` is running.`,
    });
  }
});

app.post("/api/remove-background", async (req, res) => {
  const { baseImage, bgColor } = req.body as {
    baseImage?: { data?: string; mimeType?: string };
    bgColor?: string;
  };

  if (!baseImage?.data) {
    res.status(400).json({ error: "Request must include a baseImage { data, mimeType }." });
    return;
  }

  try {
    const pyResponse = await fetch(`${PYTHON_SERVICE_URL}/remove-background`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_base64: baseImage.data, bg_color: bgColor ?? "#f5f5f5" }),
    });

    const json = await pyResponse.json();
    if (!pyResponse.ok) {
      res.status(502).json({ error: json.error ?? "The local AI image service returned an error." });
      return;
    }

    res.json({ imageDataUrl: json.imageDataUrl });
  } catch (err) {
    const message = errorMessage(err, "Unknown error.");
    res.status(502).json({
      error: `Could not reach the local AI image service on port 8001 (${message}). Make sure \`npm run ai-service\` is running.`,
    });
  }
});

// Creating a real login (Supabase Auth user) requires the service_role key,
// which must never reach the browser — this endpoint is the only place it's
// used, kept entirely server-side.
app.post("/api/admin/create-user", async (req, res) => {
  const adminClient = supabaseAdmin();
  if (!adminClient) {
    res.status(500).json({
      error: "VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your .env file and restart `npm run server`.",
    });
    return;
  }

  const { name, email, password, role } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: "admin" | "staff";
  };

  if (!name || !email || !password || !role) {
    res.status(400).json({ error: "Request must include name, email, password, and role." });
    return;
  }

  try {
    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError) throw createError;

    const { data: profile, error: profileError } = await adminClient
      .from("admin_users")
      .insert({ id: created.user.id, name, email, role, active: true })
      .select()
      .single();
    if (profileError) throw profileError;

    res.json({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      active: profile.active,
    });
  } catch (err) {
    const message = errorMessage(err, "Unknown error creating the account.");
    res.status(502).json({ error: message });
  }
});

// Creates a real customer login (Supabase Auth user, service_role-created so
// email confirmation isn't required) plus its matching `customers` profile
// row. Kept server-side for the same reason as /api/admin/create-user: the
// service_role key that creates a pre-confirmed Auth user must never reach
// the browser. The frontend signs the customer in separately right after
// this succeeds, via the normal (anon-key) signInWithPassword flow.
app.post("/api/customers/signup", async (req, res) => {
  const adminClient = supabaseAdmin();
  if (!adminClient) {
    res.status(500).json({ error: "Supabase service role is not configured on the server." });
    return;
  }

  const { name, email, password, phone } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
  };

  if (!name || !email || !password || !phone) {
    res.status(400).json({ error: "Request must include name, email, password, and phone." });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters." });
    return;
  }

  try {
    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError) throw createError;

    const { data: profile, error: profileError } = await adminClient
      .from("customers")
      .insert({ auth_user_id: created.user.id, name, email, phone })
      .select()
      .single();
    if (profileError) throw profileError;

    res.json({ id: profile.id });
  } catch (err) {
    const message = errorMessage(err, "Unknown error creating the account.");
    res.status(502).json({ error: message });
  }
});

interface CheckoutCartItem {
  productId: string;
  size: string;
  name: string;
  colorway: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CheckoutCustomer {
  name: string;
  email: string;
  phone: string;
}

// Creates a "pending" Order in Supabase, then a PayMongo Checkout Session for
// it, and hands back the hosted checkout URL to redirect the browser to. The
// order is marked "paid" later by the webhook once PayMongo confirms payment
// — never trust the browser's success redirect alone for that.
//
// Customer name/email/phone and the shipping address are collected by our
// own checkout form and saved here directly — PayMongo's hosted page is a
// payment page, not an address form, and its `billing` object (used only as
// a fallback in the webhook below) is not guaranteed to include a delivery
// address, especially for e-wallet methods like GCash/Maya.
app.post("/api/create-checkout-session", async (req, res) => {
  if (!paymongoSecretKey) {
    res.status(500).json({ error: "PayMongo is not configured on the server. Add PAYMONGO_SECRET_KEY to .env and restart `npm run server`." });
    return;
  }
  const adminClient = supabaseAdmin();
  if (!adminClient) {
    res.status(500).json({ error: "Supabase service role is not configured on the server." });
    return;
  }

  const { items, customer, shippingAddress } = req.body as {
    items?: CheckoutCartItem[];
    customer?: CheckoutCustomer;
    shippingAddress?: string;
  };
  if (!items || items.length === 0) {
    res.status(400).json({ error: "Cart is empty." });
    return;
  }
  if (!customer?.name || !customer?.email || !customer?.phone || !shippingAddress) {
    res.status(400).json({ error: "Request must include customer { name, email, phone } and a shippingAddress." });
    return;
  }

  // Checkout now requires a signed-in account — verify the browser's
  // Supabase access token server-side and resolve it to a real customer row
  // ourselves. Never trust a client-supplied customerId directly, that would
  // let anyone attach an order to someone else's account.
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
  if (!token) {
    res.status(401).json({ error: "Sign in before checking out." });
    return;
  }
  const { data: userData } = await adminClient.auth.getUser(token);
  if (!userData.user) {
    res.status(401).json({ error: "Your session has expired — please sign in again." });
    return;
  }
  const { data: customerRow } = await adminClient.from("customers").select("id").eq("auth_user_id", userData.user.id).maybeSingle();
  if (!customerRow) {
    res.status(401).json({ error: "No customer account found for this session." });
    return;
  }
  const customerId = customerRow.id;

  try {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = subtotal >= 2000 ? 0 : 150;
    const total = subtotal + shippingFee;
    const orderNumber = `BZ-${Math.floor(10000 + Math.random() * 90000)}`;

    const { data: order, error: orderError } = await adminClient
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        status: "pending",
        subtotal,
        shipping_fee: shippingFee,
        total,
        shipping_address: shippingAddress,
        payment_method: "PayMongo",
      })
      .select()
      .single();
    if (orderError) throw orderError;

    const { error: itemsError } = await adminClient.from("order_items").insert(
      items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        size: item.size,
        quantity: item.quantity,
        unit_price: item.price,
      }))
    );
    if (itemsError) throw itemsError;

    const appUrl = process.env.APP_URL ?? "http://localhost:3000";

    const lineItems = items.map((item) => ({
      currency: "PHP",
      amount: Math.round(item.price * 100),
      name: `${item.name} ${item.colorway} — Size ${item.size}`,
      quantity: item.quantity,
      images: item.imageUrl.startsWith("http") ? [item.imageUrl] : undefined,
    }));

    if (shippingFee > 0) {
      lineItems.push({
        currency: "PHP",
        amount: Math.round(shippingFee * 100),
        name: "Standard Shipping",
        quantity: 1,
        images: undefined,
      });
    }

    const paymongoResponse = await fetch(`${PAYMONGO_API}/checkout_sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: paymongoAuthHeader() },
      body: JSON.stringify({
        data: {
          attributes: {
            line_items: lineItems,
            payment_method_types: ["card", "gcash", "paymaya"],
            description: `BZ Lifestyle Shoes order ${orderNumber}`,
            reference_number: order.id,
            send_email_receipt: true,
            show_line_items: true,
            billing: { name: customer.name, email: customer.email, phone: customer.phone },
            success_url: `${appUrl}/order-confirmation?session_id=${order.id}`,
            cancel_url: `${appUrl}/?checkout=cancelled`,
          },
        },
      }),
    });

    const paymongoJson = await paymongoResponse.json();
    if (!paymongoResponse.ok) {
      throw new Error(paymongoJson.errors?.[0]?.detail ?? "PayMongo rejected the checkout request.");
    }

    await adminClient.from("orders").update({ paymongo_checkout_session_id: paymongoJson.data.id }).eq("id", order.id);

    res.json({ url: paymongoJson.data.attributes.checkout_url });
  } catch (err) {
    const message = errorMessage(err, "Unknown error creating checkout session.");
    res.status(502).json({ error: message });
  }
});

// Looked up by the order-confirmation page after PayMongo redirects back —
// uses the service_role key server-side since the orders table has no
// public/anon read access (guest checkouts have no logged-in session).
app.get("/api/checkout-session/:orderId", async (req, res) => {
  const adminClient = supabaseAdmin();
  if (!adminClient) {
    res.status(500).json({ error: "Supabase service role is not configured on the server." });
    return;
  }

  try {
    const { data: order, error } = await adminClient
      .from("orders")
      .select(
        "order_number, status, total, customer_email, tracking_number, courier, shipped_at, order_items(product_name, size, quantity, unit_price)"
      )
      .eq("id", req.params.orderId)
      .maybeSingle();
    if (error) throw error;
    if (!order) {
      res.status(404).json({ error: "Order not found." });
      return;
    }
    res.json(order);
  } catch (err) {
    const message = errorMessage(err, "Could not fetch order.");
    res.status(502).json({ error: message });
  }
});

// Called by the admin dashboard right after a tracking number is saved.
// Uses the service_role key to read the order (guest checkouts have no
// public/anon read access) and Resend's API to email the customer —
// Supabase's built-in email only covers Auth flows (signup/reset), not
// arbitrary transactional email, so this has to go through a real provider.
app.post("/api/orders/:orderId/notify-shipped", async (req, res) => {
  if (!resendApiKey) {
    res.status(500).json({ error: "RESEND_API_KEY is not set. Add it to your .env file and restart `npm run server`." });
    return;
  }
  const adminClient = supabaseAdmin();
  if (!adminClient) {
    res.status(500).json({ error: "Supabase service role is not configured on the server." });
    return;
  }

  try {
    const { data: order, error } = await adminClient
      .from("orders")
      .select("order_number, customer_name, customer_email, tracking_number, courier")
      .eq("id", req.params.orderId)
      .maybeSingle();
    if (error) throw error;
    if (!order) {
      res.status(404).json({ error: "Order not found." });
      return;
    }
    if (!order.customer_email) {
      res.status(400).json({ error: "This order has no customer email on file — nothing to send." });
      return;
    }

    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #111;">Your order is on its way!</h2>
        <p>Hi ${order.customer_name || "there"},</p>
        <p>Order <strong>${order.order_number}</strong> has shipped via <strong>${order.courier || "J&T Express"}</strong>.</p>
        <p style="font-family: monospace; font-size: 16px; background: #f5f5f5; padding: 10px 14px; border-radius: 8px; display: inline-block;">
          ${order.tracking_number}
        </p>
        <p><a href="https://www.jtexpress.ph/" target="_blank" rel="noreferrer">Track your package on jtexpress.ph &rarr;</a></p>
        <p style="color: #888; font-size: 12px; margin-top: 24px;">— BZ Lifestyle Shoes</p>
      </div>
    `;

    const resendResponse = await fetch(RESEND_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendApiKey}` },
      body: JSON.stringify({
        from: "BZ Lifestyle Shoes <onboarding@resend.dev>",
        to: [order.customer_email],
        subject: `Your order ${order.order_number} has shipped!`,
        html,
      }),
    });

    const resendJson = await resendResponse.json();
    if (!resendResponse.ok) {
      throw new Error(resendJson.message ?? "Resend rejected the email.");
    }

    res.json({ sent: true });
  } catch (err) {
    const message = errorMessage(err, "Could not send the shipping notification email.");
    res.status(502).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`API server ready on http://localhost:${PORT}`);
});

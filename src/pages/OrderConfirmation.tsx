import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Clock, XCircle, Truck } from "lucide-react";
import logoBZLI from "../../assets/logo/logoBZLI.png";

interface ConfirmedOrder {
  order_number: string;
  status: string;
  total: number;
  customer_email: string;
  tracking_number: string | null;
  courier: string | null;
  shipped_at: string | null;
  order_items: { product_name: string; size: string; quantity: number; unit_price: number }[];
}

function formatPeso(value: number): string {
  return `₱${value.toLocaleString("en-PH")}`;
}

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState<ConfirmedOrder | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setError("Missing checkout session.");
      setIsLoading(false);
      return;
    }

    let attempts = 0;
    let cancelled = false;

    // The webhook that marks the order "paid" can land a second or two after
    // Stripe redirects the browser back here, so poll briefly instead of
    // treating "still pending" as a failure.
    const poll = async () => {
      try {
        const response = await fetch(`/api/checkout-session/${sessionId}`);
        const json = await response.json();
        if (!response.ok) throw new Error(json.error ?? "Order not found.");
        if (cancelled) return;
        setOrder(json);
        setIsLoading(false);
        if (json.status === "paid") {
          localStorage.removeItem("bz_cart");
        } else if (attempts < 4) {
          attempts += 1;
          setTimeout(poll, 2000);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load your order.");
        setIsLoading(false);
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl shadow-sm p-8 text-center">
        <div className="w-12 h-12 rounded-xl overflow-hidden mx-auto mb-6">
          <img src={logoBZLI} alt="BZ Lifestyle Shoes" className="w-full h-full object-cover" />
        </div>

        {isLoading ? (
          <>
            <div className="w-10 h-10 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-neutral-500">Confirming your order...</p>
          </>
        ) : error ? (
          <>
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-lg font-bold text-neutral-900 mb-2">Something went wrong</h1>
            <p className="text-sm text-neutral-500 mb-6">{error}</p>
          </>
        ) : order?.status === "paid" ? (
          <>
            <CheckCircle2 className="w-12 h-12 text-teal-500 mx-auto mb-4" />
            <h1 className="text-lg font-bold text-neutral-900 mb-1">Thank you for your order!</h1>
            <p className="text-sm text-neutral-500 mb-6">
              Order {order.order_number} is confirmed. A receipt has been sent to {order.customer_email || "your email"}.
            </p>
          </>
        ) : (
          <>
            <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h1 className="text-lg font-bold text-neutral-900 mb-1">Payment received</h1>
            <p className="text-sm text-neutral-500 mb-6">
              Order {order?.order_number} is being confirmed — this can take a few seconds. Refresh this page shortly.
            </p>
          </>
        )}

        {order?.tracking_number && (
          <div className="text-left bg-teal-50 border border-teal-100 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Truck className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-1">
                Shipped via {order.courier || "J&T Express"}
              </p>
              <p className="text-sm font-mono font-semibold text-neutral-900">{order.tracking_number}</p>
              <a
                href="https://www.jtexpress.ph/"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-teal-600 hover:underline"
              >
                Track on jtexpress.ph &rarr;
              </a>
            </div>
          </div>
        )}

        {order && (
          <div className="text-left border-t border-neutral-200 pt-5 mb-6 flex flex-col gap-2">
            {order.order_items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-neutral-600">
                  {item.product_name} · Size {item.size} × {item.quantity}
                </span>
                <span className="font-semibold text-neutral-900">{formatPeso(item.unit_price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-neutral-100">
              <span>Total</span>
              <span>{formatPeso(order.total)}</span>
            </div>
          </div>
        )}

        <Link to="/" className="inline-block w-full py-3 rounded-full bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800 transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

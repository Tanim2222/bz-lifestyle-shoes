import type { Order, OrderStatus } from "../types";
import { supabase } from "./supabaseClient";

interface OrderRow {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: OrderStatus;
  subtotal: number;
  shipping_fee: number;
  total: number;
  shipping_address: string;
  payment_method: string;
  tracking_number: string | null;
  courier: string;
  shipped_at: string | null;
  created_at: string;
  updated_at: string;
  order_items: { product_id: string | null; product_name: string; size: string; quantity: number; unit_price: number }[];
}

function mapRow(row: OrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id ?? "",
    customerName: row.customer_name,
    customerEmail: row.customer_email ?? "",
    customerPhone: row.customer_phone ?? "",
    items: (row.order_items ?? []).map((item) => ({
      productId: item.product_id ?? "",
      productName: item.product_name,
      size: item.size,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
    })),
    status: row.status,
    subtotal: Number(row.subtotal),
    shippingFee: Number(row.shipping_fee),
    total: Number(row.total),
    shippingAddress: row.shipping_address,
    paymentMethod: row.payment_method,
    trackingNumber: row.tracking_number,
    courier: row.courier ?? "J&T Express",
    shippedAt: row.shipped_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const SELECT_WITH_ITEMS = "*, order_items(product_id, product_name, size, quantity, unit_price)";

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase.from("orders").select(SELECT_WITH_ITEMS).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as OrderRow[]).map(mapRow);
}

export async function getOrder(id: string): Promise<Order | undefined> {
  const { data, error } = await supabase.from("orders").select(SELECT_WITH_ITEMS).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRow(data as OrderRow) : undefined;
}

export async function getOrdersForCustomer(customerId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(SELECT_WITH_ITEMS)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as OrderRow[]).map(mapRow);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  const updated = await getOrder(id);
  if (!updated) throw new Error("Order not found after update.");
  return updated;
}

// Saving a tracking number is what actually moves an order to "shipped" —
// there's no separate courier API integration, so this is the manual J&T
// Express workflow: admin books the shipment outside the system, then
// records the resulting tracking number here.
export async function updateTracking(id: string, trackingNumber: string, courier: string): Promise<Order> {
  const { error } = await supabase
    .from("orders")
    .update({
      tracking_number: trackingNumber,
      courier,
      status: "shipped",
      shipped_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  const updated = await getOrder(id);
  if (!updated) throw new Error("Order not found after update.");
  return updated;
}

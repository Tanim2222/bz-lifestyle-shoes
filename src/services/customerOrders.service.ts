import { supabase } from "../admin/services/supabaseClient";

export interface CustomerOrderItem {
  productName: string;
  size: string;
  quantity: number;
  unitPrice: number;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  shippingAddress: string;
  trackingNumber: string | null;
  courier: string;
  shippedAt: string | null;
  createdAt: string;
  items: CustomerOrderItem[];
}

interface OrderRow {
  id: string;
  order_number: string;
  status: string;
  total: number;
  shipping_address: string;
  tracking_number: string | null;
  courier: string;
  shipped_at: string | null;
  created_at: string;
  order_items: { product_name: string; size: string; quantity: number; unit_price: number }[];
}

function mapRow(row: OrderRow): CustomerOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    total: Number(row.total),
    shippingAddress: row.shipping_address,
    trackingNumber: row.tracking_number,
    courier: row.courier,
    shippedAt: row.shipped_at,
    createdAt: row.created_at,
    items: (row.order_items ?? []).map((i) => ({
      productName: i.product_name,
      size: i.size,
      quantity: i.quantity,
      unitPrice: Number(i.unit_price),
    })),
  };
}

const SELECT_WITH_ITEMS =
  "id, order_number, status, total, shipping_address, tracking_number, courier, shipped_at, created_at, order_items(product_name, size, quantity, unit_price)";

// RLS ("customers read own orders") already scopes this to the logged-in
// customer — the explicit customer_id filter here is just for a tighter,
// more efficient query, not the security boundary itself.
export async function getMyOrders(customerId: string): Promise<CustomerOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(SELECT_WITH_ITEMS)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as OrderRow[]).map(mapRow);
}

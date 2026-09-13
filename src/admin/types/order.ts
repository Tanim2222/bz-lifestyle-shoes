export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "completed" | "cancelled";

export interface OrderItem {
  productId: string;
  productName: string;
  size: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingAddress: string;
  paymentMethod: string;
  trackingNumber: string | null;
  courier: string;
  shippedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
];

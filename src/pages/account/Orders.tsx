import { useEffect, useState } from "react";
import { Package, Truck } from "lucide-react";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import * as customerOrdersService from "../../services/customerOrders.service";
import type { CustomerOrder } from "../../services/customerOrders.service";

function formatPeso(value: number): string {
  return `₱${value.toLocaleString("en-PH")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-neutral-100 text-neutral-600",
  paid: "bg-blue-50 text-blue-600",
  processing: "bg-amber-50 text-amber-600",
  shipped: "bg-teal-50 text-teal-600",
  completed: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-600",
};

const CANCELLABLE_STATUSES = new Set(["pending", "paid"]);

export default function Orders() {
  const { customer } = useCustomerAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = () => {
    if (!customer) return;
    customerOrdersService.getMyOrders(customer.id).then((data) => {
      setOrders(data);
      setIsLoading(false);
    });
  };

  useEffect(load, [customer]);

  const handleCancel = async (orderId: string) => {
    if (!confirm("Cancel this order? This can't be undone.")) return;
    setCancellingId(orderId);
    try {
      await customerOrdersService.cancelOrder(orderId);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not cancel this order.");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-1">My Orders</h1>
      <p className="text-sm text-neutral-500 mb-6">Every order placed while signed in appears here.</p>

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-neutral-200 rounded-2xl">
          <Package className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">No orders yet — go check out the catalog!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div key={order.id} className="border border-neutral-200 rounded-2xl p-5">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div>
                  <p className="font-mono font-semibold text-neutral-900">{order.orderNumber}</p>
                  <p className="text-xs text-neutral-400">{formatDate(order.createdAt)}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[order.status] ?? "bg-neutral-100 text-neutral-600"}`}>
                  {order.status}
                </span>
              </div>

              <div className="flex flex-col gap-1 mb-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm text-neutral-600">
                    <span>
                      {item.productName} · Size {item.size} × {item.quantity}
                    </span>
                    <span className="font-medium text-neutral-900">{formatPeso(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-100 gap-3 flex-wrap">
                <span className="text-sm font-bold text-neutral-900">Total: {formatPeso(order.total)}</span>
                {order.trackingNumber && (
                  <div className="flex items-center gap-1.5 text-xs text-teal-600">
                    <Truck className="w-3.5 h-3.5" />
                    <span className="font-mono">{order.trackingNumber}</span>
                  </div>
                )}
                {CANCELLABLE_STATUSES.has(order.status) && (
                  <button
                    onClick={() => handleCancel(order.id)}
                    disabled={cancellingId === order.id}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 cursor-pointer"
                  >
                    {cancellingId === order.id ? "Cancelling…" : "Cancel Order"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

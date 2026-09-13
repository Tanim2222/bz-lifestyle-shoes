import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, CreditCard, User, Truck } from "lucide-react";
import Spinner from "../../components/Spinner";
import StatusBadge from "../../components/StatusBadge";
import * as ordersService from "../../services/orders.service";
import type { Order, OrderStatus } from "../../types";
import { ORDER_STATUSES } from "../../types";

function formatPeso(value: number): string {
  return `₱${value.toLocaleString("en-PH")}`;
}

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [trackingInput, setTrackingInput] = useState("");
  const [courierInput, setCourierInput] = useState("J&T Express");
  const [isSavingTracking, setIsSavingTracking] = useState(false);
  const [notifyStatus, setNotifyStatus] = useState<"idle" | "sent" | "failed">("idle");

  const load = async () => {
    if (!orderId) return;
    setIsLoading(true);
    const data = await ordersService.getOrder(orderId);
    setOrder(data ?? null);
    setTrackingInput(data?.trackingNumber ?? "");
    setCourierInput(data?.courier ?? "J&T Express");
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, [orderId]);

  const handleStatusChange = async (status: OrderStatus) => {
    if (!order) return;
    setIsUpdating(true);
    const updated = await ordersService.updateOrderStatus(order.id, status);
    setOrder(updated);
    setIsUpdating(false);
  };

  const handleSaveTracking = async () => {
    if (!order || !trackingInput.trim()) return;
    setIsSavingTracking(true);
    setNotifyStatus("idle");
    const updated = await ordersService.updateTracking(order.id, trackingInput.trim(), courierInput.trim() || "J&T Express");
    setOrder(updated);
    setIsSavingTracking(false);

    // The order is already saved/shipped at this point regardless of whether
    // the email goes through — a failed notification shouldn't undo that.
    try {
      const response = await fetch(`/api/orders/${order.id}/notify-shipped`, { method: "POST" });
      setNotifyStatus(response.ok ? "sent" : "failed");
    } catch {
      setNotifyStatus("failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-24">
        <p className="text-white/60 mb-4">Order not found.</p>
        <button onClick={() => navigate("/admin/orders")} className="text-teal-300 text-sm hover:underline cursor-pointer">
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <button
        onClick={() => navigate("/admin/orders")}
        className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </button>

      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-white font-mono">{order.orderNumber}</h2>
          <p className="text-white/40 text-sm mt-1">
            Placed {new Date(order.createdAt).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <select
            value={order.status}
            disabled={isUpdating}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50 capitalize cursor-pointer disabled:opacity-50"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s} className="bg-neutral-900 capitalize">
                Mark as {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
          <h3 className="text-white font-semibold mb-4">Items</h3>
          <div className="flex flex-col divide-y divide-white/5">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-white text-sm font-medium">{item.productName}</p>
                  <p className="text-white/50 text-xs mt-0.5">Size {item.size} · Qty {item.quantity}</p>
                </div>
                <p className="text-white text-sm font-medium">{formatPeso(item.unitPrice * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 mt-3 pt-3 flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between text-white/60">
              <span>Subtotal</span>
              <span>{formatPeso(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Shipping</span>
              <span>{formatPeso(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between text-white font-semibold text-base pt-1">
              <span>Total</span>
              <span>{formatPeso(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-wider font-semibold mb-3">
              <User className="w-3.5 h-3.5" /> Customer
            </div>
            <p className="text-white text-sm font-medium">{order.customerName}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-wider font-semibold mb-3">
              <MapPin className="w-3.5 h-3.5" /> Shipping Address
            </div>
            <p className="text-white/80 text-sm leading-relaxed">{order.shippingAddress || "No address on file."}</p>
            {order.customerPhone && <p className="text-white/50 text-xs mt-2">{order.customerPhone}</p>}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-wider font-semibold mb-3">
              <CreditCard className="w-3.5 h-3.5" /> Payment Method
            </div>
            <p className="text-white/80 text-sm">{order.paymentMethod}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-wider font-semibold mb-3">
              <Truck className="w-3.5 h-3.5" /> Shipment
            </div>
            {order.trackingNumber ? (
              <div className="mb-3">
                <p className="text-white text-sm font-mono font-medium">{order.trackingNumber}</p>
                <p className="text-white/50 text-xs mt-0.5">
                  {order.courier}
                  {order.shippedAt && ` · shipped ${new Date(order.shippedAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}`}
                </p>
              </div>
            ) : (
              <p className="text-white/40 text-xs mb-3">Not shipped yet. Book the shipment with J&T Express outside this system, then record the tracking number below.</p>
            )}
            <div className="flex flex-col gap-2">
              <input
                value={courierInput}
                onChange={(e) => setCourierInput(e.target.value)}
                placeholder="Courier"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              />
              <input
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                placeholder="Tracking number"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              />
              <button
                onClick={handleSaveTracking}
                disabled={isSavingTracking || !trackingInput.trim()}
                className="w-full py-2 rounded-lg bg-teal-400 text-black text-xs font-bold hover:bg-teal-300 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSavingTracking ? "Saving..." : "Save & Mark as Shipped"}
              </button>
              {notifyStatus === "sent" && <p className="text-teal-300 text-xs text-center">✓ Customer notified by email.</p>}
              {notifyStatus === "failed" && (
                <p className="text-amber-400 text-xs text-center">Order saved, but the email notification failed to send.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { OrderStatus } from "../types";

const STYLES: Record<OrderStatus, string> = {
  pending: "bg-yellow-400/10 text-yellow-300 border-yellow-400/20",
  paid: "bg-blue-400/10 text-blue-300 border-blue-400/20",
  processing: "bg-purple-400/10 text-purple-300 border-purple-400/20",
  shipped: "bg-cyan-400/10 text-cyan-300 border-cyan-400/20",
  completed: "bg-teal-400/10 text-teal-300 border-teal-400/20",
  cancelled: "bg-red-400/10 text-red-300 border-red-400/20",
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wider ${STYLES[status]}`}>
      {status}
    </span>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import DataTable, { type Column } from "../../components/DataTable";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import * as ordersService from "../../services/orders.service";
import type { Order, OrderStatus } from "../../types";
import { ORDER_STATUSES } from "../../types";

function formatPeso(value: number): string {
  return `₱${value.toLocaleString("en-PH")}`;
}

export default function OrdersList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    ordersService.getOrders().then((data) => {
      setOrders(data);
      setIsLoading(false);
    });
  }, []);

  const filtered = useMemo(
    () => (statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter)),
    [orders, statusFilter]
  );

  const columns: Column<Order>[] = [
    { key: "orderNumber", header: "Order", render: (o) => <span className="font-mono text-white font-medium">{o.orderNumber}</span> },
    { key: "customer", header: "Customer", render: (o) => <span className="text-white/80">{o.customerName}</span> },
    { key: "items", header: "Items", render: (o) => o.items.reduce((s, i) => s + i.quantity, 0) },
    { key: "total", header: "Total", render: (o) => formatPeso(o.total) },
    { key: "status", header: "Status", render: (o) => <StatusBadge status={o.status} /> },
    { key: "date", header: "Date", render: (o) => new Date(o.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
            statusFilter === "all" ? "bg-white text-black border-white" : "bg-white/5 text-white/60 border-white/10 hover:border-white/20"
          }`}
        >
          All
        </button>
        {ORDER_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border capitalize transition-colors cursor-pointer ${
              statusFilter === status ? "bg-white text-black border-white" : "bg-white/5 text-white/60 border-white/10 hover:border-white/20"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(o) => o.id}
        searchPlaceholder="Search order # or customer..."
        searchKeys={["orderNumber", "customerName"]}
        isLoading={isLoading}
        onRowClick={(o) => navigate(`/admin/orders/${o.id}`)}
        emptyState={<EmptyState icon={ShoppingBag} title="No orders found" description="Orders will show up here once customers start checking out." />}
      />
    </div>
  );
}

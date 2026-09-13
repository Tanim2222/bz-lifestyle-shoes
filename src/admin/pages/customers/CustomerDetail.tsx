import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Calendar } from "lucide-react";
import Spinner from "../../components/Spinner";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import { ShoppingBag } from "lucide-react";
import * as customersService from "../../services/customers.service";
import * as ordersService from "../../services/orders.service";
import type { Customer, Order } from "../../types";

function formatPeso(value: number): string {
  return `₱${value.toLocaleString("en-PH")}`;
}

export default function CustomerDetail() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!customerId) return;
    Promise.all([customersService.getCustomer(customerId), ordersService.getOrdersForCustomer(customerId)]).then(
      ([c, o]) => {
        setCustomer(c ?? null);
        setOrders(o);
        setIsLoading(false);
      }
    );
  }, [customerId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-24">
        <p className="text-white/60 mb-4">Customer not found.</p>
        <button onClick={() => navigate("/admin/customers")} className="text-teal-300 text-sm hover:underline cursor-pointer">
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <button
        onClick={() => navigate("/admin/customers")}
        className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Customers
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-teal-400/20 border border-teal-400/30 flex items-center justify-center text-teal-300 text-lg font-bold uppercase">
          {customer.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">{customer.name}</h2>
          <p className="text-white/40 text-sm">Customer since {new Date(customer.joinedAt).toLocaleDateString("en-PH", { month: "long", year: "numeric" })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-wider font-semibold mb-2">
            <Mail className="w-3.5 h-3.5" /> Email
          </div>
          <p className="text-white text-sm">{customer.email}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-wider font-semibold mb-2">
            <Phone className="w-3.5 h-3.5" /> Phone
          </div>
          <p className="text-white text-sm">{customer.phone}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-wider font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5" /> Total Spent
          </div>
          <p className="text-white text-sm font-semibold">{formatPeso(customer.totalSpent)}</p>
        </div>
      </div>

      <h3 className="text-white font-semibold mb-3">Order History</h3>
      <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/5">
        {orders.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="No orders yet" />
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/admin/orders/${order.id}`)}
              className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/5 transition-colors"
            >
              <div>
                <p className="text-white text-sm font-mono font-medium">{order.orderNumber}</p>
                <p className="text-white/40 text-xs mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-white text-sm font-medium">{formatPeso(order.total)}</p>
                <StatusBadge status={order.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

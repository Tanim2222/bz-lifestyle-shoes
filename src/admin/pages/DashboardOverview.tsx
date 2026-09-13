import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { DollarSign, ShoppingBag, AlertTriangle, UserPlus } from "lucide-react";
import StatCard from "../components/StatCard";
import Spinner from "../components/Spinner";
import { getDashboardMetrics, getSalesTrend, type DashboardMetrics, type SalesPoint } from "../services/reports.service";

function formatPeso(value: number): string {
  return `₱${value.toLocaleString("en-PH")}`;
}

export default function DashboardOverview() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [trend, setTrend] = useState<SalesPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getDashboardMetrics(), getSalesTrend(14)]).then(([m, t]) => {
      if (!active) return;
      setMetrics(m);
      setTrend(t);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Sales" value={formatPeso(metrics.totalSales)} accent="teal" />
        <StatCard icon={ShoppingBag} label="Orders Today" value={String(metrics.ordersToday)} accent="white" />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock Alerts"
          value={String(metrics.lowStockCount)}
          hint={metrics.lowStockCount > 0 ? "Needs restocking" : "All good"}
          accent={metrics.lowStockCount > 0 ? "red" : "teal"}
        />
        <StatCard icon={UserPlus} label="New Customers" value={String(metrics.newCustomersThisWeek)} hint="Last 7 days" accent="yellow" />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
        <h2 className="text-white font-semibold mb-1">Sales Trend</h2>
        <p className="text-white/40 text-xs mb-6">Last 14 days</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} width={64} tickFormatter={(v) => v.toLocaleString("en-PH")} />
              <Tooltip
                contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                formatter={(value: number) => [formatPeso(value), "Sales"]}
              />
              <Area type="monotone" dataKey="sales" stroke="#2dd4bf" strokeWidth={2} fill="url(#salesGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

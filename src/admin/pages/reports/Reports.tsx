import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Spinner from "../../components/Spinner";
import * as reportsService from "../../services/reports.service";
import type { SalesPoint, BestSeller } from "../../services/reports.service";
import type { InventoryLog } from "../../types";

function formatPeso(value: number): string {
  return `₱${value.toLocaleString("en-PH")}`;
}

const RANGE_OPTIONS = [
  { label: "7 Days", days: 7 },
  { label: "14 Days", days: 14 },
  { label: "30 Days", days: 30 },
];

export default function Reports() {
  const [rangeDays, setRangeDays] = useState(14);
  const [trend, setTrend] = useState<SalesPoint[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [stockMovement, setStockMovement] = useState<InventoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    Promise.all([reportsService.getSalesTrend(rangeDays), reportsService.getBestSellers(5), reportsService.getStockMovement()]).then(
      ([t, b, m]) => {
        if (!active) return;
        setTrend(t);
        setBestSellers(b);
        setStockMovement(m);
        setIsLoading(false);
      }
    );
    return () => {
      active = false;
    };
  }, [rangeDays]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  const totalForRange = trend.reduce((sum, p) => sum + p.sales, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-white/50 text-sm">Total sales for period</p>
          <p className="text-2xl font-semibold text-white">{formatPeso(totalForRange)}</p>
        </div>
        <div className="flex gap-2">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              onClick={() => setRangeDays(opt.days)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                rangeDays === opt.days ? "bg-white text-black border-white" : "bg-white/5 text-white/60 border-white/10 hover:border-white/20"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
        <h2 className="text-white font-semibold mb-6">Sales Over Time</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} width={64} tickFormatter={(v) => v.toLocaleString("en-PH")} />
              <Tooltip
                contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                formatter={(value: number) => [formatPeso(value), "Sales"]}
              />
              <Line type="monotone" dataKey="sales" stroke="#2dd4bf" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
          <h2 className="text-white font-semibold mb-6">Best-Selling Products</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bestSellers} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="productName"
                  tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={140}
                />
                <Tooltip
                  contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                  formatter={(value: number) => [`${value} units`, "Sold"]}
                />
                <Bar dataKey="unitsSold" fill="#2dd4bf" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
          <h2 className="text-white font-semibold mb-4">Stock Movement</h2>
          <div className="flex flex-col divide-y divide-white/5 max-h-64 overflow-y-auto">
            {stockMovement.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-8">No stock movement recorded.</p>
            ) : (
              stockMovement.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="text-white/90">{log.productName}</p>
                    <p className="text-xs text-white/40">{log.size} · {log.reason}</p>
                  </div>
                  <span className={`font-semibold ${log.change > 0 ? "text-teal-300" : "text-red-400"}`}>
                    {log.change > 0 ? "+" : ""}
                    {log.change}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

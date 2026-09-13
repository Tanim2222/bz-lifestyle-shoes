import { useEffect, useState } from "react";
import { Boxes, SlidersHorizontal, AlertTriangle } from "lucide-react";
import DataTable, { type Column } from "../../components/DataTable";
import EmptyState from "../../components/EmptyState";
import StockAdjustModal from "./StockAdjustModal";
import * as inventoryService from "../../services/inventory.service";
import type { InventoryRow } from "../../services/inventory.service";
import type { InventoryLog } from "../../types";

export default function InventoryList() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adjustingRow, setAdjustingRow] = useState<InventoryRow | null>(null);

  const load = async () => {
    setIsLoading(true);
    const [inv, logEntries] = await Promise.all([inventoryService.getInventory(), inventoryService.getInventoryLogs()]);
    setRows(inv);
    setLogs(logEntries);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const columns: Column<InventoryRow>[] = [
    { key: "product", header: "Product", render: (r) => <span className="font-medium text-white">{r.productName} — {r.colorway}</span> },
    { key: "size", header: "Size", render: (r) => <span className="text-white/70">{r.size}</span> },
    {
      key: "stock",
      header: "Stock",
      render: (r) => (
        <span className={`font-semibold ${r.lowStock ? "text-red-400" : "text-white"}`}>{r.stock}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) =>
        r.lowStock ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border bg-red-400/10 text-red-300 border-red-400/20">
            <AlertTriangle className="w-3 h-3" /> Low Stock
          </span>
        ) : (
          <span className="text-xs font-semibold px-2 py-1 rounded-full border bg-teal-400/10 text-teal-300 border-teal-400/20">In Stock</span>
        ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (r) => (
        <button
          onClick={() => setAdjustingRow(r)}
          className="flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white/80 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3 h-3" />
          Adjust
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DataTable
        columns={columns}
        data={rows}
        keyExtractor={(r) => `${r.productId}-${r.size}`}
        searchPlaceholder="Search inventory..."
        searchKeys={["productName", "colorway", "size"]}
        isLoading={isLoading}
        emptyState={<EmptyState icon={Boxes} title="No inventory data" />}
      />

      <div>
        <h3 className="text-white font-semibold mb-3">Recent Stock Adjustments</h3>
        <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/5">
          {logs.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-8">No adjustments logged yet.</p>
          ) : (
            logs.slice(0, 8).map((log) => (
              <div key={log.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                <div>
                  <p className="text-white">{log.productName} <span className="text-white/40">· {log.size}</span></p>
                  <p className="text-xs text-white/40 mt-0.5">{log.reason} — by {log.adjustedBy}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${log.change > 0 ? "text-teal-300" : "text-red-400"}`}>
                    {log.change > 0 ? "+" : ""}
                    {log.change}
                  </p>
                  <p className="text-xs text-white/40">→ {log.resultingStock}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {adjustingRow && (
        <StockAdjustModal
          row={adjustingRow}
          onClose={() => setAdjustingRow(null)}
          onSaved={() => {
            setAdjustingRow(null);
            load();
          }}
        />
      )}
    </div>
  );
}

import { useState, type FormEvent } from "react";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import { useAuth } from "../../context/AuthContext";
import * as inventoryService from "../../services/inventory.service";
import type { InventoryRow } from "../../services/inventory.service";

export default function StockAdjustModal({
  row,
  onClose,
  onSaved,
}: {
  row: InventoryRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const change = Number(delta);
    if (!delta || Number.isNaN(change) || change === 0) {
      setError("Enter a non-zero number (positive to add, negative to remove).");
      return;
    }
    if (!reason.trim()) {
      setError("A reason is required for the log.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      await inventoryService.adjustStock(row.productId, row.size, change, reason.trim(), user?.name ?? "Unknown");
      onSaved();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Adjust Stock" maxWidth="max-w-sm">
      <div className="mb-5 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
        <p className="text-sm text-white font-medium">{row.productName} — {row.colorway}</p>
        <p className="text-xs text-white/50 mt-0.5">Size {row.size} · Current stock: {row.stock}</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Adjustment</label>
          <input
            type="number"
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            placeholder="e.g. 10 or -2"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Reason</label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Restock from supplier, damaged unit, etc."
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-black text-sm font-bold hover:from-teal-300 hover:to-cyan-300 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSaving && <Spinner className="w-4 h-4 border-black/30 border-t-black" />}
            Save Adjustment
          </button>
        </div>
      </form>
    </Modal>
  );
}

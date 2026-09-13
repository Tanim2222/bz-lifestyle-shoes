import { useState, type FormEvent } from "react";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import * as promotionsService from "../../services/promotions.service";
import type { Promotion, DiscountType } from "../../types";

interface FormState {
  code: string;
  description: string;
  discountType: DiscountType;
  value: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

function toFormState(promo: Promotion | null): FormState {
  if (promo) {
    return {
      code: promo.code,
      description: promo.description,
      discountType: promo.discountType,
      value: String(promo.value),
      startDate: promo.startDate.slice(0, 10),
      endDate: promo.endDate.slice(0, 10),
      active: promo.active,
    };
  }
  const today = new Date().toISOString().slice(0, 10);
  return { code: "", description: "", discountType: "percentage", value: "", startDate: today, endDate: today, active: true };
}

export default function PromotionFormModal({
  promotion,
  onClose,
  onSaved,
}: {
  promotion: Promotion | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => toFormState(promotion));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.code.trim()) next.code = "Promo code is required.";
    const valueNum = Number(form.value);
    if (!form.value || Number.isNaN(valueNum) || valueNum <= 0) next.value = "Enter a valid discount value.";
    if (form.discountType === "percentage" && valueNum > 100) next.value = "Percentage cannot exceed 100.";
    if (!form.startDate || !form.endDate) next.dates = "Both start and end dates are required.";
    else if (form.endDate < form.startDate) next.dates = "End date must be after start date.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      const input = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim(),
        discountType: form.discountType,
        value: Number(form.value),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        active: form.active,
      };
      if (promotion) {
        await promotionsService.updatePromotion(promotion.id, input);
      } else {
        await promotionsService.createPromotion(input);
      }
      onSaved();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={promotion ? "Edit Promotion" : "Add Promotion"} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Promo Code</label>
          <input
            value={form.code}
            onChange={(e) => setField("code", e.target.value)}
            placeholder="WELCOME10"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white uppercase placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
          />
          {errors.code && <p className="text-xs text-red-400">{errors.code}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Description</label>
          <input
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="10% off for first-time customers"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Discount Type</label>
            <select
              value={form.discountType}
              onChange={(e) => setField("discountType", e.target.value as DiscountType)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            >
              <option value="percentage" className="bg-neutral-900">Percentage</option>
              <option value="fixed" className="bg-neutral-900">Fixed Amount</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              Value {form.discountType === "percentage" ? "(%)" : "(₱)"}
            </label>
            <input
              type="number"
              min="0"
              value={form.value}
              onChange={(e) => setField("value", e.target.value)}
              placeholder={form.discountType === "percentage" ? "10" : "500"}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            />
          </div>
        </div>
        {errors.value && <p className="text-xs text-red-400 -mt-2">{errors.value}</p>}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Start Date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setField("startDate", e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">End Date</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setField("endDate", e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            />
          </div>
        </div>
        {errors.dates && <p className="text-xs text-red-400 -mt-2">{errors.dates}</p>}

        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <input type="checkbox" checked={form.active} onChange={(e) => setField("active", e.target.checked)} className="w-4 h-4 accent-teal-400" />
          <span className="text-sm text-white/80">Active</span>
        </label>

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
            {promotion ? "Save Changes" : "Add Promotion"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

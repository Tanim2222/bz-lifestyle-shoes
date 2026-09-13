import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Percent } from "lucide-react";
import DataTable, { type Column } from "../../components/DataTable";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import PromotionFormModal from "./PromotionFormModal";
import { useAuth } from "../../context/AuthContext";
import * as promotionsService from "../../services/promotions.service";
import type { Promotion } from "../../types";

export default function PromotionsList() {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Promotion | "new" | null>(null);
  const [deleting, setDeleting] = useState<Promotion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    setPromotions(await promotionsService.getPromotions());
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async (id: string) => {
    await promotionsService.togglePromotion(id);
    load();
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    await promotionsService.deletePromotion(deleting.id);
    setIsDeleting(false);
    setDeleting(null);
    load();
  };

  const columns: Column<Promotion>[] = [
    { key: "code", header: "Code", render: (p) => <span className="font-mono font-semibold text-white">{p.code}</span> },
    { key: "description", header: "Description", render: (p) => <span className="text-white/70">{p.description}</span> },
    {
      key: "discount",
      header: "Discount",
      render: (p) => <span className="text-white">{p.discountType === "percentage" ? `${p.value}%` : `₱${p.value.toLocaleString("en-PH")}`}</span>,
    },
    {
      key: "period",
      header: "Period",
      render: (p) => (
        <span className="text-white/60 text-xs">
          {new Date(p.startDate).toLocaleDateString("en-PH", { month: "short", day: "numeric" })} –{" "}
          {new Date(p.endDate).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
        </span>
      ),
    },
    { key: "usage", header: "Uses", render: (p) => p.usageCount },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <button
          onClick={() => handleToggle(p.id)}
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
            p.active ? "bg-teal-400/10 text-teal-300 border-teal-400/20" : "bg-white/5 text-white/40 border-white/10"
          }`}
        >
          {p.active ? "Active" : "Inactive"}
        </button>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setEditing(p)}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Edit promotion"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {user?.role === "admin" && (
            <button
              onClick={() => setDeleting(p)}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              aria-label="Delete promotion"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-white/50 text-sm">{promotions.length} promotions</p>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-black text-sm font-bold hover:from-teal-300 hover:to-cyan-300 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Promotion
        </button>
      </div>

      <DataTable
        columns={columns}
        data={promotions}
        keyExtractor={(p) => p.id}
        searchPlaceholder="Search promo codes..."
        searchKeys={["code", "description"]}
        isLoading={isLoading}
        emptyState={<EmptyState icon={Percent} title="No promotions yet" description="Create a discount code to run your first campaign." />}
      />

      {editing && (
        <PromotionFormModal
          promotion={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete this promotion?"
        description={`"${deleting?.code}" will no longer be usable at checkout.`}
        isLoading={isDeleting}
      />
    </div>
  );
}

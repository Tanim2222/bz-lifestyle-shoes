import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, LayoutGrid } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import Spinner from "../../components/Spinner";
import ShopCategoryFormModal from "./ShopCategoryFormModal";
import * as shopCategoriesService from "../../services/shopCategories.service";
import type { ShopCategory } from "../../types";

export default function ShopCategoriesPanel() {
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<ShopCategory | "new" | null>(null);
  const [deleting, setDeleting] = useState<ShopCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setCategories(await shopCategoriesService.getShopCategories());
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    await shopCategoriesService.deleteShopCategory(deleting.id);
    setIsDeleting(false);
    setDeleting(null);
    load();
  };

  const move = async (index: number, direction: -1 | 1) => {
    const current = categories[index];
    const target = categories[index + direction];
    if (!target) return;
    setReorderingId(current.id);
    await Promise.all([
      shopCategoriesService.updateShopCategory(current.id, { sortOrder: target.sortOrder }),
      shopCategoriesService.updateShopCategory(target.id, { sortOrder: current.sortOrder }),
    ]);
    setReorderingId(null);
    load();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-white/50 text-sm">{categories.length} tiles — shown in this order in "Shop by Category"</p>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-black text-sm font-bold hover:from-teal-300 hover:to-cyan-300 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Tile
        </button>
      </div>

      {categories.length === 0 ? (
        <EmptyState icon={LayoutGrid} title="No category tiles yet" description="Add at least one tile so the storefront's Shop by Category section has something to show." />
      ) : (
        <div className="flex flex-col gap-3">
          {categories.map((cat, i) => (
            <div key={cat.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-neutral-900 border border-white/10 flex items-center justify-center">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.label} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[9px] text-white/30 text-center px-1">No image</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{cat.label}</p>
                <p className="text-xs text-white/50 truncate">{cat.href}{!cat.active && " · Hidden"}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0 || reorderingId !== null}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === categories.length - 1 || reorderingId !== null}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditing(cat)}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Edit tile"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleting(cat)}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  aria-label="Delete tile"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <ShopCategoryFormModal
          category={editing === "new" ? null : editing}
          nextSortOrder={categories.length}
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
        title="Delete this tile?"
        description={`"${deleting?.label}" will be removed from Shop by Category.`}
        isLoading={isDeleting}
      />
    </div>
  );
}

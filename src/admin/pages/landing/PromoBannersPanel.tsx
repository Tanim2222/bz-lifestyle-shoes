import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Megaphone } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import Spinner from "../../components/Spinner";
import PromoBannerFormModal from "./PromoBannerFormModal";
import * as promoBannersService from "../../services/promoBanners.service";
import type { PromoBanner } from "../../types";

export default function PromoBannersPanel() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<PromoBanner | "new" | null>(null);
  const [deleting, setDeleting] = useState<PromoBanner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setBanners(await promoBannersService.getPromoBanners());
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    await promoBannersService.deletePromoBanner(deleting.id);
    setIsDeleting(false);
    setDeleting(null);
    load();
  };

  const move = async (index: number, direction: -1 | 1) => {
    const current = banners[index];
    const target = banners[index + direction];
    if (!target) return;
    setReorderingId(current.id);
    await Promise.all([
      promoBannersService.updatePromoBanner(current.id, { sortOrder: target.sortOrder }),
      promoBannersService.updatePromoBanner(target.id, { sortOrder: current.sortOrder }),
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
        <p className="text-white/50 text-sm">{banners.length} banners — shown in this order in the Promo Strip</p>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-black text-sm font-bold hover:from-teal-300 hover:to-cyan-300 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      {banners.length === 0 ? (
        <EmptyState icon={Megaphone} title="No promo banners yet" description="Add at least one banner so the storefront's promo strip has something to show." />
      ) : (
        <div className="flex flex-col gap-3">
          {banners.map((banner, i) => (
            <div key={banner.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-neutral-900 border border-white/10 flex items-center justify-center">
                {banner.imageUrl ? (
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[9px] text-white/30 text-center px-1">No image</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{banner.title}</p>
                <p className="text-xs text-white/50 truncate">{banner.copy || "No copy set"}{!banner.active && " · Hidden"}</p>
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
                  disabled={i === banners.length - 1 || reorderingId !== null}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditing(banner)}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Edit banner"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleting(banner)}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  aria-label="Delete banner"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <PromoBannerFormModal
          banner={editing === "new" ? null : editing}
          nextSortOrder={banners.length}
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
        title="Delete this banner?"
        description={`"${deleting?.title}" will be removed from the promo strip.`}
        isLoading={isDeleting}
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, GalleryHorizontal, Box, Video } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import Spinner from "../../components/Spinner";
import HeroSlideFormModal from "./HeroSlideFormModal";
import * as heroSlidesService from "../../services/heroSlides.service";
import type { HeroSlide } from "../../types";

export default function HeroSlidesPanel() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<HeroSlide | "new" | null>(null);
  const [deleting, setDeleting] = useState<HeroSlide | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setSlides(await heroSlidesService.getHeroSlides());
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    await heroSlidesService.deleteHeroSlide(deleting.id);
    setIsDeleting(false);
    setDeleting(null);
    load();
  };

  const move = async (index: number, direction: -1 | 1) => {
    const current = slides[index];
    const target = slides[index + direction];
    if (!target) return;
    setReorderingId(current.id);
    await Promise.all([
      heroSlidesService.updateHeroSlide(current.id, { sortOrder: target.sortOrder }),
      heroSlidesService.updateHeroSlide(target.id, { sortOrder: current.sortOrder }),
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
        <p className="text-white/50 text-sm">{slides.length} slides — shown in this order on the storefront hero</p>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-black text-sm font-bold hover:from-teal-300 hover:to-cyan-300 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Slide
        </button>
      </div>

      {slides.length === 0 ? (
        <EmptyState icon={GalleryHorizontal} title="No hero slides yet" description="Add at least one slide so the storefront hero has something to show." />
      ) : (
        <div className="flex flex-col gap-3">
          {slides.map((slide, i) => (
            <div key={slide.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-3">
              <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-neutral-900 border border-white/10 flex items-center justify-center">
                {slide.is3d ? (
                  <Box className="w-6 h-6 text-white/40" />
                ) : slide.videoUrl ? (
                  <>
                    <video src={slide.videoUrl} className="w-full h-full object-cover" muted />
                    <Video className="absolute bottom-1 right-1 w-3.5 h-3.5 text-white drop-shadow" />
                  </>
                ) : slide.imageUrl ? (
                  <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[9px] text-white/30 text-center px-1">No image</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{slide.title}</p>
                <p className="text-xs text-white/50 truncate">
                  {slide.eyebrow}
                  {slide.is3d && " · 3D Viewer"}
                  {!slide.is3d && slide.videoUrl && " · Video"}
                  {!slide.active && " · Hidden"}
                </p>
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
                  disabled={i === slides.length - 1 || reorderingId !== null}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditing(slide)}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Edit slide"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleting(slide)}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  aria-label="Delete slide"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <HeroSlideFormModal
          slide={editing === "new" ? null : editing}
          nextSortOrder={slides.length}
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
        title="Delete this slide?"
        description={`"${deleting?.title}" will be removed from the storefront hero.`}
        isLoading={isDeleting}
      />
    </div>
  );
}

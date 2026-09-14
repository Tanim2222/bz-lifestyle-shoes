import { useState, type FormEvent } from "react";
import { Upload, X } from "lucide-react";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import AccentColorPicker from "./AccentColorPicker";
import * as heroSlidesService from "../../services/heroSlides.service";
import * as storageService from "../../services/storage.service";
import type { HeroSlide, AccentColor } from "../../types";

export default function HeroSlideFormModal({
  slide,
  nextSortOrder,
  onClose,
  onSaved,
}: {
  slide: HeroSlide | null;
  nextSortOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [eyebrow, setEyebrow] = useState(slide?.eyebrow ?? "");
  const [title, setTitle] = useState(slide?.title ?? "");
  const [subtitle, setSubtitle] = useState(slide?.subtitle ?? "");
  const [ctaLabel, setCtaLabel] = useState(slide?.ctaLabel ?? "Shop Now");
  const [ctaHref, setCtaHref] = useState(slide?.ctaHref ?? "/shop");
  const [imageUrl, setImageUrl] = useState<string | null>(slide?.imageUrl ?? null);
  const [videoUrl, setVideoUrl] = useState<string | null>(slide?.videoUrl ?? null);
  const [mediaMode, setMediaMode] = useState<"image" | "video">(slide?.videoUrl ? "video" : "image");
  const [is3d, setIs3d] = useState(slide?.is3d ?? false);
  const [accentColor, setAccentColor] = useState<AccentColor>(slide?.accentColor ?? "teal");
  const [active, setActive] = useState(slide?.active ?? true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleImageChange = async (file: File | undefined) => {
    if (!file) return;
    setIsUploading(true);
    try {
      setImageUrl(await storageService.uploadProductImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleVideoChange = async (file: File | undefined) => {
    if (!file) return;
    setIsUploading(true);
    try {
      setVideoUrl(await storageService.uploadProductImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload video. Keep clips short (a few seconds, under ~20MB) for fast loading.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      const input = {
        eyebrow: eyebrow.trim(),
        title: title.trim(),
        subtitle: subtitle.trim(),
        ctaLabel: ctaLabel.trim() || "Shop Now",
        ctaHref: ctaHref.trim() || "/shop",
        imageUrl: mediaMode === "image" ? imageUrl : null,
        videoUrl: mediaMode === "video" ? videoUrl : null,
        is3d,
        accentColor,
        sortOrder: slide?.sortOrder ?? nextSortOrder,
        active,
      };
      if (slide) {
        await heroSlidesService.updateHeroSlide(slide.id, input);
      } else {
        await heroSlidesService.createHeroSlide(input);
      }
      onSaved();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={slide ? "Edit Hero Slide" : "Add Hero Slide"} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <input type="checkbox" checked={is3d} onChange={(e) => setIs3d(e.target.checked)} className="w-4 h-4 accent-teal-400" />
          <span className="text-sm text-white/80">Show the interactive 3D shoe viewer instead of an image</span>
        </label>

        {!is3d && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMediaMode("image")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                  mediaMode === "image" ? "bg-white text-black border-white" : "bg-white/5 text-white/60 border-white/10 hover:border-white/20"
                }`}
              >
                Image
              </button>
              <button
                type="button"
                onClick={() => setMediaMode("video")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                  mediaMode === "video" ? "bg-white text-black border-white" : "bg-white/5 text-white/60 border-white/10 hover:border-white/20"
                }`}
              >
                Video
              </button>
            </div>

            {mediaMode === "image" ? (
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 shrink-0 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Slide preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-white/30 text-center px-1">No image</span>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <Spinner className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10 transition-colors cursor-pointer w-fit">
                    <Upload className="w-4 h-4" />
                    Upload Image
                    <input type="file" accept="image/*" className="hidden" disabled={isUploading} onChange={(e) => handleImageChange(e.target.files?.[0])} />
                  </label>
                  {imageUrl && (
                    <button type="button" onClick={() => setImageUrl(null)} className="flex items-center gap-1.5 text-xs text-white/50 hover:text-red-400 transition-colors cursor-pointer w-fit">
                      <X className="w-3.5 h-3.5" />
                      Remove image
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 shrink-0 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center">
                  {videoUrl ? (
                    <video src={videoUrl} className="w-full h-full object-cover" muted />
                  ) : (
                    <span className="text-[10px] text-white/30 text-center px-1">No video</span>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <Spinner className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10 transition-colors cursor-pointer w-fit">
                    <Upload className="w-4 h-4" />
                    Upload Video
                    <input type="file" accept="video/*" className="hidden" disabled={isUploading} onChange={(e) => handleVideoChange(e.target.files?.[0])} />
                  </label>
                  {videoUrl && (
                    <button type="button" onClick={() => setVideoUrl(null)} className="flex items-center gap-1.5 text-xs text-white/50 hover:text-red-400 transition-colors cursor-pointer w-fit">
                      <X className="w-3.5 h-3.5" />
                      Remove video
                    </button>
                  )}
                  <p className="text-[11px] text-white/40 max-w-xs">Keep it short and light (a few seconds, muted, under ~20MB) so the hero loads fast.</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Eyebrow (small tag above title)</label>
          <input
            value={eyebrow}
            onChange={(e) => setEyebrow(e.target.value)}
            placeholder="New Drop"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Aero-Stride v2 just landed"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Subtitle</label>
          <textarea
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            rows={2}
            placeholder="Short supporting line."
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Button Text</label>
            <input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Button Link</label>
            <input value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Accent Color</label>
          <AccentColorPicker value={accentColor} onChange={setAccentColor} />
        </div>

        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4 accent-teal-400" />
          <span className="text-sm text-white/80">Show on storefront</span>
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
            {slide ? "Save Changes" : "Add Slide"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

import { useState, type FormEvent } from "react";
import { Upload, X } from "lucide-react";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import AccentColorPicker from "./AccentColorPicker";
import * as promoBannersService from "../../services/promoBanners.service";
import * as storageService from "../../services/storage.service";
import type { PromoBanner, AccentColor } from "../../types";

export default function PromoBannerFormModal({
  banner,
  nextSortOrder,
  onClose,
  onSaved,
}: {
  banner: PromoBanner | null;
  nextSortOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(banner?.title ?? "");
  const [copy, setCopy] = useState(banner?.copy ?? "");
  const [ctaLabel, setCtaLabel] = useState(banner?.ctaLabel ?? "Shop Now");
  const [href, setHref] = useState(banner?.href ?? "/shop");
  const [imageUrl, setImageUrl] = useState<string | null>(banner?.imageUrl ?? null);
  const [accentColor, setAccentColor] = useState<AccentColor>(banner?.accentColor ?? "teal");
  const [active, setActive] = useState(banner?.active ?? true);
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
        title: title.trim(),
        copy: copy.trim(),
        ctaLabel: ctaLabel.trim() || "Shop Now",
        href: href.trim() || "/shop",
        imageUrl,
        accentColor,
        sortOrder: banner?.sortOrder ?? nextSortOrder,
        active,
      };
      if (banner) {
        await promoBannersService.updatePromoBanner(banner.id, input);
      } else {
        await promoBannersService.createPromoBanner(input);
      }
      onSaved();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={banner ? "Edit Promo Banner" : "Add Promo Banner"} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center">
            {imageUrl ? (
              <img src={imageUrl} alt="Banner preview" className="w-full h-full object-cover" />
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
              Upload Image (optional)
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

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Up to 40% Off"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Copy</label>
          <textarea
            value={copy}
            onChange={(e) => setCopy(e.target.value)}
            rows={2}
            placeholder="Selected styles, while stocks last."
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
            <input value={href} onChange={(e) => setHref(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50" />
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
            {banner ? "Save Changes" : "Add Banner"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

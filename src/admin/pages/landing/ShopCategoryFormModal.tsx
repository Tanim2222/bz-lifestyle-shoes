import { useState, type FormEvent } from "react";
import { Upload, X } from "lucide-react";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import * as shopCategoriesService from "../../services/shopCategories.service";
import * as storageService from "../../services/storage.service";
import type { ShopCategory } from "../../types";

export default function ShopCategoryFormModal({
  category,
  nextSortOrder,
  onClose,
  onSaved,
}: {
  category: ShopCategory | null;
  nextSortOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [label, setLabel] = useState(category?.label ?? "");
  const [href, setHref] = useState(category?.href ?? "#shop-by-category");
  const [imageUrl, setImageUrl] = useState<string | null>(category?.imageUrl ?? null);
  const [active, setActive] = useState(category?.active ?? true);
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
    if (!label.trim()) {
      setError("Label is required.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      const input = {
        label: label.trim(),
        href: href.trim() || "#shop-by-category",
        imageUrl,
        sortOrder: category?.sortOrder ?? nextSortOrder,
        active,
      };
      if (category) {
        await shopCategoriesService.updateShopCategory(category.id, input);
      } else {
        await shopCategoriesService.createShopCategory(input);
      }
      onSaved();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={category ? "Edit Category Tile" : "Add Category Tile"} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center">
            {imageUrl ? (
              <img src={imageUrl} alt="Category preview" className="w-full h-full object-cover" />
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

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Label</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Basketball"
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Link (where it goes when clicked)</label>
          <input
            value={href}
            onChange={(e) => setHref(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50"
          />
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
            {category ? "Save Changes" : "Add Tile"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

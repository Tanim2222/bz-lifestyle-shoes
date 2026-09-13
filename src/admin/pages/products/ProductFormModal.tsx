import { useState, type FormEvent } from "react";
import { Upload, Sparkles, Wand2 } from "lucide-react";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import * as productsService from "../../services/products.service";
import * as imageGenerationService from "../../services/imageGeneration.service";
import * as storageService from "../../services/storage.service";
import type { Product, Category, ProductVariant } from "../../types";

const DEFAULT_SIZES = ["US 8", "US 8.5", "US 9", "US 9.5", "US 10", "US 11", "US 12"];
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600";

// One shared "house style" instruction so every generated variant looks like
// part of the same collection — admin only fills in the colorway/keyword.
// Switching to "Custom Prompt" bypasses this entirely for one-off edits.
const DEFAULT_STYLE_PROMPT = "Make this shoe {colorway}, with a glossy premium finish, keep the same shape and design";

const BG_COLOR_PRESETS = [
  { label: "Studio White", value: "#f5f5f5" },
  { label: "Studio Gray", value: "#d4d4d4" },
  { label: "Jet Black", value: "#0a0a0a" },
  { label: "Brand Red", value: "#dc2626" },
];

interface FormState {
  name: string;
  categoryId: string;
  price: string;
  description: string;
  colorway: string;
  imageUrl: string;
  active: boolean;
  variants: ProductVariant[];
}

function toFormState(product: Product | null, categories: Category[]): FormState {
  if (product) {
    return {
      name: product.name,
      categoryId: product.categoryId,
      price: String(product.price),
      description: product.description,
      colorway: product.colorway,
      imageUrl: product.imageUrl,
      active: product.active,
      variants: product.variants,
    };
  }
  return {
    name: "",
    categoryId: categories[0]?.id ?? "",
    price: "",
    description: "",
    colorway: "",
    imageUrl: FALLBACK_IMAGE,
    active: true,
    variants: DEFAULT_SIZES.map((size) => ({ size, stock: 0 })),
  };
}

export default function ProductFormModal({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => toFormState(product, categories));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [promptMode, setPromptMode] = useState<"default" | "custom">("default");
  const [styleKeyword, setStyleKeyword] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showBgPanel, setShowBgPanel] = useState(false);
  const [bgColor, setBgColor] = useState(BG_COLOR_PRESETS[0].value);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgError, setBgError] = useState("");

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setVariantStock = (size: string, stock: number) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => (v.size === size ? { ...v, stock: Math.max(0, stock) } : v)),
    }));
  };

  const handleImageChange = async (file: File | undefined) => {
    if (!file) return;
    setUploadError("");
    setIsUploading(true);
    try {
      const publicUrl = await storageService.uploadProductImage(file);
      setField("imageUrl", publicUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = async () => {
    const finalPrompt =
      promptMode === "default"
        ? DEFAULT_STYLE_PROMPT.replace("{colorway}", styleKeyword.trim())
        : customPrompt.trim();

    if (promptMode === "default" && !styleKeyword.trim()) {
      setAiError("Enter the colorway or keyword (e.g. crimson red, matte black).");
      return;
    }
    if (promptMode === "custom" && !customPrompt.trim()) {
      setAiError("Write a prompt describing the change you want.");
      return;
    }

    setAiError("");
    setIsGenerating(true);
    try {
      const generatedDataUrl = await imageGenerationService.generateProductImage(form.imageUrl, finalPrompt);
      // The AI service returns a data: URL — upload it to Storage so it
      // survives past this browser tab, same as a manual upload would.
      const blob = await storageService.urlToBlob(generatedDataUrl);
      const publicUrl = await storageService.uploadProductImage(blob);
      setField("imageUrl", publicUrl);
      setShowAiPanel(false);
      setStyleKeyword("");
      setCustomPrompt("");
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveBackground = async () => {
    setBgError("");
    setIsRemovingBg(true);
    try {
      const resultDataUrl = await imageGenerationService.removeBackground(form.imageUrl, bgColor);
      const blob = await storageService.urlToBlob(resultDataUrl);
      const publicUrl = await storageService.uploadProductImage(blob);
      setField("imageUrl", publicUrl);
    } catch (err) {
      setBgError(err instanceof Error ? err.message : "Failed to remove background.");
    } finally {
      setIsRemovingBg(false);
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Product name is required.";
    if (!form.colorway.trim()) next.colorway = "Colorway is required.";
    if (!form.categoryId) next.categoryId = "Select a category.";
    const priceNum = Number(form.price);
    if (!form.price || Number.isNaN(priceNum) || priceNum <= 0) next.price = "Enter a valid price greater than 0.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      const input = {
        name: form.name.trim(),
        categoryId: form.categoryId,
        price: Number(form.price),
        description: form.description.trim(),
        colorway: form.colorway.trim(),
        imageUrl: form.imageUrl,
        active: form.active,
        variants: form.variants,
      };
      if (product) {
        await productsService.updateProduct(product.id, input);
      } else {
        await productsService.createProduct(input);
      }
      onSaved();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={product ? "Edit Product" : "Add Product"} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative w-20 h-20 shrink-0">
              <img src={form.imageUrl} alt="Preview" className="w-20 h-20 rounded-xl object-cover bg-white/5 border border-white/10" />
              {(isGenerating || isUploading || isRemovingBg) && (
                <div className="absolute inset-0 rounded-xl bg-black/70 flex items-center justify-center">
                  <Spinner className="w-5 h-5" />
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              Upload Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => handleImageChange(e.target.files?.[0])}
              />
            </label>
            <button
              type="button"
              onClick={() => setShowAiPanel((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-400/10 border border-teal-400/20 text-sm text-teal-300 hover:bg-teal-400/20 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Generate with AI
            </button>
            <button
              type="button"
              onClick={() => setShowBgPanel((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-fuchsia-400/10 border border-fuchsia-400/20 text-sm text-fuchsia-300 hover:bg-fuchsia-400/20 transition-colors cursor-pointer"
            >
              <Wand2 className="w-4 h-4" />
              Clean Background
            </button>
          </div>
          {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}

          {showBgPanel && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
              <p className="text-[11px] text-white/40">
                Removes the background, box, and tags from the current photo and places just the shoe on a plain studio backdrop. Use this on a messy phone photo before generating colorways.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {BG_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setBgColor(preset.value)}
                      title={preset.label}
                      className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-transform ${
                        bgColor === preset.value ? "border-white scale-110" : "border-white/20"
                      }`}
                      style={{ backgroundColor: preset.value }}
                    />
                  ))}
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    title="Custom color"
                    className="w-7 h-7 rounded-full border-2 border-white/20 cursor-pointer bg-transparent p-0"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveBackground}
                  disabled={isRemovingBg}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-400 to-purple-400 text-black text-sm font-bold hover:from-fuchsia-300 hover:to-purple-300 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isRemovingBg && <Spinner className="w-4 h-4 border-black/30 border-t-black" />}
                  Clean It Up
                </button>
              </div>
              {bgError && <p className="text-xs text-red-400">{bgError}</p>}
            </div>
          )}

          {showAiPanel && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPromptMode("default")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                    promptMode === "default" ? "bg-white text-black border-white" : "bg-white/5 text-white/60 border-white/10 hover:border-white/20"
                  }`}
                >
                  Default Style
                </button>
                <button
                  type="button"
                  onClick={() => setPromptMode("custom")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                    promptMode === "custom" ? "bg-white text-black border-white" : "bg-white/5 text-white/60 border-white/10 hover:border-white/20"
                  }`}
                >
                  Custom Prompt
                </button>
              </div>

              {promptMode === "default" ? (
                <>
                  <p className="text-[11px] text-white/40">
                    Uses the same house-style instruction every time (glossy finish, same shape) — just tell it the colorway, so every product stays visually consistent as one collection.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <input
                      value={styleKeyword}
                      onChange={(e) => setStyleKeyword(e.target.value)}
                      placeholder="e.g. crimson red, matte black, sunset orange"
                      className="flex-1 min-w-[220px] bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                    />
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-black text-sm font-bold hover:from-teal-300 hover:to-cyan-300 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isGenerating && <Spinner className="w-4 h-4 border-black/30 border-t-black" />}
                      Generate
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[11px] text-white/40">
                    Write your own full instruction — overrides the default style for this one-off edit.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <input
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="e.g. turn this into a high-top with a wool texture"
                      className="flex-1 min-w-[220px] bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                    />
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 text-black text-sm font-bold hover:from-teal-300 hover:to-cyan-300 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isGenerating && <Spinner className="w-4 h-4 border-black/30 border-t-black" />}
                      Generate
                    </button>
                  </div>
                </>
              )}
              {aiError && <p className="text-xs text-red-400">{aiError}</p>}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Product Name</label>
            <input
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Aero-Stride v2"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Colorway</label>
            <input
              value={form.colorway}
              onChange={(e) => setField("colorway", e.target.value)}
              placeholder="Electric Teal"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            />
            {errors.colorway && <p className="text-xs text-red-400">{errors.colorway}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => setField("categoryId", e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-neutral-900">
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs text-red-400">{errors.categoryId}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Price (₱)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
              placeholder="9000"
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            />
            {errors.price && <p className="text-xs text-red-400">{errors.price}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={2}
            placeholder="Short product description shown on the storefront."
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50 resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2 block">Sizes &amp; Stock</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {form.variants.map((v) => (
              <div key={v.size} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                <p className="text-[11px] text-white/50 mb-1">{v.size}</p>
                <input
                  type="number"
                  min="0"
                  value={v.stock}
                  onChange={(e) => setVariantStock(v.size, Number(e.target.value))}
                  className="w-full bg-transparent text-sm text-white focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <input type="checkbox" checked={form.active} onChange={(e) => setField("active", e.target.checked)} className="w-4 h-4 accent-teal-400" />
          <span className="text-sm text-white/80">Active on storefront</span>
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
            {product ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

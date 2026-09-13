import { useEffect, useState } from "react";
import { Heart, Pause, Play, ShoppingBag } from "lucide-react";
import * as productsService from "../admin/services/products.service";
import * as categoriesService from "../admin/services/categories.service";
import type { Product, Category } from "../admin/types";
import { useCart } from "../context/CartContext";

function formatPeso(value: number): string {
  return `₱${value.toLocaleString("en-PH")}`;
}

export default function ShoeCarousel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [paused, setPaused] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = (product: Product) => {
    const variant = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
    if (!variant) return;
    addItem({
      productId: product.id,
      size: variant.size,
      name: product.name,
      colorway: product.colorway,
      price: product.price,
      imageUrl: product.imageUrl,
    });
  };

  useEffect(() => {
    let active = true;
    Promise.all([productsService.getProducts(), categoriesService.getCategories()]).then(([p, c]) => {
      if (!active) return;
      setProducts(p.filter((product) => product.active));
      setCategories(c);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "";

  // Render the set twice — the CSS animation slides exactly one set's
  // width (-50%) then loops, so the seam is invisible.
  const belt = [...products, ...products];

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="shrink-0 w-[260px] sm:w-[280px] aspect-[260/360] bg-neutral-100 border border-neutral-200 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex gap-4 w-max shoe-marquee"
        style={{ animationPlayState: paused ? "paused" : "running" }}
      >
        {belt.map((p, i) => (
          <div
            key={`${p.id}-${i}`}
            className="shrink-0 w-[260px] sm:w-[280px] bg-white border border-neutral-200 overflow-hidden shadow-sm"
          >
            <div className="relative bg-neutral-100 aspect-square flex items-center justify-center">
              <button
                onClick={() => setLiked((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200 flex items-center justify-center cursor-pointer z-10 transition-transform hover:scale-110"
                aria-label="Add to wishlist"
              >
                <Heart className={`w-4 h-4 transition-colors ${liked[p.id] ? "fill-red-500 text-red-500" : "text-neutral-500"}`} />
              </button>
              <img
                src={p.imageUrl}
                alt={`${p.name} ${p.colorway}`}
                className="w-full h-full object-contain p-8"
                style={{ filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.15))" }}
                draggable={false}
              />
              <button
                onClick={() => handleAddToCart(p)}
                className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center cursor-pointer z-10 hover:scale-110 transition-transform"
                aria-label="Add to cart"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm font-bold text-neutral-900">{formatPeso(p.price)}</p>
              <p className="text-sm text-neutral-600">{p.name} {p.colorway}</p>
              <p className="text-xs text-teal-600">{categoryName(p.categoryId)}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setPaused((v) => !v)}
        className="absolute right-2 bottom-2 sm:right-4 sm:bottom-4 w-10 h-10 rounded-full bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 text-white flex items-center justify-center shadow-lg cursor-pointer z-10 hover:scale-105 hover:bg-neutral-900 transition-all"
        aria-label={paused ? "Resume scrolling" : "Pause scrolling"}
      >
        {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
      </button>
    </div>
  );
}

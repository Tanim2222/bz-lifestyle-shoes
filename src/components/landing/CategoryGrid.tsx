import { useEffect, useState, type MouseEvent } from "react";
import { ImageOff } from "lucide-react";
import Reveal from "./Reveal";
import * as shopCategoriesService from "../../admin/services/shopCategories.service";
import type { ShopCategory } from "../../admin/types";

export default function CategoryGrid({ onSelectCategory }: { onSelectCategory: (label: string) => void }) {
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    shopCategoriesService.getShopCategories().then((data) => {
      setCategories(data.filter((c) => c.active));
      setIsLoading(false);
    });
  }, []);

  if (!isLoading && categories.length === 0) return null;

  const handleClick = (label: string) => (e: MouseEvent) => {
    e.preventDefault();
    onSelectCategory(label);
    document.getElementById("trending")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="shop-by-category" className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-28">
      <Reveal>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-6">Shop by Category</h2>
      </Reveal>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[4/3] bg-neutral-100 border border-neutral-200 animate-pulse" />)
          : categories.map((cat, i) => (
              <Reveal key={cat.id} delay={i * 0.08}>
                <a
                  href="#trending"
                  onClick={handleClick(cat.label)}
                  className="group relative block aspect-[4/3] overflow-hidden border border-neutral-800 bg-neutral-900 cursor-pointer"
                >
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.label}
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageOff className="w-6 h-6 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent group-hover:from-black/80 transition-colors duration-300" />
                  <div className="absolute inset-0 flex items-end p-5">
                    <span className="text-lg sm:text-xl font-bold text-white tracking-tight group-hover:translate-x-1 transition-transform duration-300">{cat.label}</span>
                  </div>
                </a>
              </Reveal>
            ))}
      </div>
    </section>
  );
}

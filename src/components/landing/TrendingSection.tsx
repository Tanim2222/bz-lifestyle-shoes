import { useEffect, useState } from "react";
import * as productsService from "../../admin/services/products.service";
import * as categoriesService from "../../admin/services/categories.service";
import type { Product, Category } from "../../admin/types";
import SectionHeader from "./SectionHeader";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";

const MAX_PRODUCTS = 8;

export default function TrendingSection({ selectedCategoryLabel }: { selectedCategoryLabel?: string | null }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

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

  // "Shop by Category" tiles are separate marketing content with no real FK
  // to the product categories table — match by name so clicking e.g. "Women"
  // jumps here already filtered, and fall back to "All" for tiles whose
  // label (Basketball, Skate, ...) doesn't correspond to a real category.
  useEffect(() => {
    if (!selectedCategoryLabel || categories.length === 0) return;
    const match = categories.find((c) => c.name.toLowerCase() === selectedCategoryLabel.toLowerCase());
    setActiveTab(match ? match.id : "all");
  }, [selectedCategoryLabel, categories]);

  const tabs = [{ id: "all", name: "All" }, ...categories];
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "";
  const filtered = (activeTab === "all" ? products : products.filter((p) => p.categoryId === activeTab)).slice(0, MAX_PRODUCTS);

  return (
    <section id="trending" className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-28">
      <SectionHeader title="Best Sellers" subtitle="Trending with the community this week" />

      <Reveal className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
              activeTab === tab.id ? "bg-neutral-900 text-white border-neutral-900" : "bg-neutral-100 text-neutral-500 border-neutral-200 hover:border-neutral-300"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </Reveal>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[260/360] bg-neutral-100 border border-neutral-200 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-neutral-400">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filtered.map((product, i) => (
            <Reveal key={product.id} delay={Math.min(i, 4) * 0.06}>
              <ProductCard product={product} categoryName={categoryName(product.categoryId)} index={i} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

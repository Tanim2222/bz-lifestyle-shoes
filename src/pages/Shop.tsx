import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import CartDrawer from "../components/landing/CartDrawer";
import ChatWidget from "../components/landing/ChatWidget";
import ProductCard from "../components/landing/ProductCard";
import * as productsService from "../admin/services/products.service";
import * as categoriesService from "../admin/services/categories.service";
import type { Product, Category } from "../admin/types";

type SortOption = "featured" | "price-asc" | "price-desc";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const query = searchParams.get("q") ?? "";
  const categoryParam = searchParams.get("category") ?? "";
  const saleOnly = searchParams.get("sale") === "true";
  const sort = (searchParams.get("sort") as SortOption) || "featured";

  useEffect(() => {
    document.title = "Shop All Shoes — BZ Lifestyle Shoes";
    Promise.all([productsService.getProducts(), categoriesService.getCategories()]).then(([p, c]) => {
      setProducts(p.filter((product) => product.active));
      setCategories(c);
      setIsLoading(false);
    });
  }, []);

  // Category tiles/nav links pass a category NAME (not id, no real FK to
  // shop_categories) — match case-insensitively, same as TrendingSection.
  const activeCategoryId = useMemo(() => {
    if (!categoryParam) return "all";
    const match = categories.find((c) => c.name.toLowerCase() === categoryParam.toLowerCase());
    return match ? match.id : "all";
  }, [categoryParam, categories]);

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "";

  const filtered = useMemo(() => {
    let result = products;
    if (activeCategoryId !== "all") result = result.filter((p) => p.categoryId === activeCategoryId);
    if (saleOnly) result = result.filter((p) => p.compareAtPrice !== null && p.compareAtPrice > p.price);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter((p) => `${p.name} ${p.colorway}`.toLowerCase().includes(q));
    }
    result = [...result];
    if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    return result;
  }, [products, activeCategoryId, saleOnly, query, sort]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 overflow-x-hidden flex flex-col">
      <Header />
      <CartDrawer />
      <ChatWidget />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-16">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-1">Shop All Shoes</h1>
        <p className="text-sm text-neutral-500 mb-6">{isLoading ? "Loading…" : `${filtered.length} pair${filtered.length === 1 ? "" : "s"}`}</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setParam("q", e.target.value)}
              placeholder="Search shoes..."
              className="w-full border border-neutral-200 rounded-full pl-10 pr-4 py-2.5 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
            />
          </div>
          <div className="relative shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={sort}
              onChange={(e) => setParam("sort", e.target.value)}
              className="border border-neutral-200 rounded-full pl-10 pr-8 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 cursor-pointer appearance-none"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button
            onClick={() => setParam("category", "")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
              activeCategoryId === "all" ? "bg-neutral-900 text-white border-neutral-900" : "bg-neutral-100 text-neutral-500 border-neutral-200 hover:border-neutral-300"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setParam("category", c.name)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                activeCategoryId === c.id ? "bg-neutral-900 text-white border-neutral-900" : "bg-neutral-100 text-neutral-500 border-neutral-200 hover:border-neutral-300"
              }`}
            >
              {c.name}
            </button>
          ))}
          <button
            onClick={() => setParam("sale", saleOnly ? "" : "true")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
              saleOnly ? "bg-red-500 text-white border-red-500" : "bg-neutral-100 text-neutral-500 border-neutral-200 hover:border-neutral-300"
            }`}
          >
            On Sale
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[260/360] bg-neutral-100 border border-neutral-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-neutral-200 rounded-2xl">
            <p className="text-sm text-neutral-500">No shoes match your search/filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} categoryName={categoryName(product.categoryId)} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

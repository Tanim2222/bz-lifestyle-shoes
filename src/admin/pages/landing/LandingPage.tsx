import { useState } from "react";
import HeroSlidesPanel from "./HeroSlidesPanel";
import ShopCategoriesPanel from "./ShopCategoriesPanel";
import PromoBannersPanel from "./PromoBannersPanel";

const TABS = [
  { id: "hero", label: "Hero Slides" },
  { id: "categories", label: "Shop by Category" },
  { id: "promos", label: "Promo Banners" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function LandingPage() {
  const [tab, setTab] = useState<TabId>("hero");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white mb-1">Landing Page</h1>
        <p className="text-white/50 text-sm">Everything shown on the storefront's homepage — hero, category tiles, and promo banners — is controlled from here.</p>
      </div>

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              tab === t.id ? "bg-teal-400/10 text-teal-300 border border-teal-400/20" : "bg-white/5 text-white/60 border border-white/10 hover:border-white/20"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "hero" && <HeroSlidesPanel />}
      {tab === "categories" && <ShopCategoriesPanel />}
      {tab === "promos" && <PromoBannersPanel />}
    </div>
  );
}

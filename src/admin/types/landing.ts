export type AccentColor = "teal" | "red" | "amber" | "fuchsia" | "cyan" | "neutral";

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string | null;
  videoUrl: string | null;
  is3d: boolean;
  accentColor: AccentColor;
  sortOrder: number;
  active: boolean;
}

export type HeroSlideInput = Omit<HeroSlide, "id">;

export interface ShopCategory {
  id: string;
  label: string;
  imageUrl: string | null;
  href: string;
  sortOrder: number;
  active: boolean;
}

export type ShopCategoryInput = Omit<ShopCategory, "id">;

export interface PromoBanner {
  id: string;
  title: string;
  copy: string;
  ctaLabel: string;
  href: string;
  imageUrl: string | null;
  accentColor: AccentColor;
  sortOrder: number;
  active: boolean;
}

export type PromoBannerInput = Omit<PromoBanner, "id">;

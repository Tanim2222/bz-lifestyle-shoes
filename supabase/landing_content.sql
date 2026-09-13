-- BZ Lifestyle Shoes — Landing Page content (Hero, Shop by Category, Promos)
-- Run this once in the Supabase SQL Editor, same as schema.sql was run.
-- Additive migration — safe to run after schema.sql without re-running it.

-- ── HERO SLIDES ─────────────────────────────────────────────
create table hero_slides (
  id uuid primary key default gen_random_uuid(),
  eyebrow text not null default '',
  title text not null,
  subtitle text not null default '',
  cta_label text not null default 'Shop Now',
  cta_href text not null default '#featured',
  image_url text,
  video_url text,
  is_3d boolean not null default false,
  accent_color text not null default 'teal' check (accent_color in ('teal','red','amber','fuchsia','cyan','neutral')),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── SHOP BY CATEGORY TILES ──────────────────────────────────
create table shop_categories (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  image_url text,
  href text not null default '#shop-by-category',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── PROMO / AD BANNERS ──────────────────────────────────────
create table promo_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  copy text not null default '',
  cta_label text not null default 'Shop Now',
  href text not null default '#featured',
  image_url text,
  accent_color text not null default 'teal' check (accent_color in ('teal','red','amber','fuchsia','cyan','neutral')),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── ROW LEVEL SECURITY ──────────────────────────────────────
-- Same pattern as products/categories: public storefront can read, only
-- logged-in admin/staff can write.
alter table hero_slides enable row level security;
alter table shop_categories enable row level security;
alter table promo_banners enable row level security;

create policy "public read hero_slides" on hero_slides for select using (true);
create policy "admin write hero_slides" on hero_slides for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read shop_categories" on shop_categories for select using (true);
create policy "admin write shop_categories" on shop_categories for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read promo_banners" on promo_banners for select using (true);
create policy "admin write promo_banners" on promo_banners for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- No new Storage bucket needed — image uploads reuse the existing
-- "product-images" bucket/policies created in schema.sql.

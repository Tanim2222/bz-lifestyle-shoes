-- BZ Lifestyle Shoes — Admin Dashboard schema
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query).

create extension if not exists "pgcrypto";

-- ── CATEGORIES ──────────────────────────────────────────────
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text not null default ''
);

-- ── PRODUCTS ────────────────────────────────────────────────
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references categories(id) on delete set null,
  price numeric not null default 0,
  description text not null default '',
  image_url text not null default '',
  colorway text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size text not null,
  stock integer not null default 0
);

-- ── CUSTOMERS ───────────────────────────────────────────────
create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null default '',
  joined_at timestamptz not null default now(),
  total_orders integer not null default 0,
  total_spent numeric not null default 0
);

-- ── ORDERS ──────────────────────────────────────────────────
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null,
  customer_id uuid references customers(id) on delete set null,
  customer_name text not null,
  status text not null default 'pending'
    check (status in ('pending','paid','processing','shipped','completed','cancelled')),
  subtotal numeric not null default 0,
  shipping_fee numeric not null default 0,
  total numeric not null default 0,
  shipping_address text not null default '',
  payment_method text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  size text not null,
  quantity integer not null default 1,
  unit_price numeric not null default 0
);

-- ── PROMOTIONS ──────────────────────────────────────────────
create table promotions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null default '',
  discount_type text not null check (discount_type in ('percentage','fixed')),
  value numeric not null default 0,
  start_date timestamptz not null,
  end_date timestamptz not null,
  active boolean not null default true,
  usage_count integer not null default 0
);

-- ── INVENTORY LOGS ──────────────────────────────────────────
create table inventory_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  size text not null,
  change integer not null,
  resulting_stock integer not null,
  reason text not null default '',
  adjusted_by text not null default '',
  created_at timestamptz not null default now()
);

-- ── ADMIN USERS ─────────────────────────────────────────────
-- id matches the Supabase Auth user's id (create the auth user first via
-- Authentication → Users → Add user, then insert the matching row here).
create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'staff' check (role in ('admin','staff')),
  active boolean not null default true,
  last_login_at timestamptz
);

-- ── ROW LEVEL SECURITY ──────────────────────────────────────
alter table categories enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table promotions enable row level security;
alter table inventory_logs enable row level security;
alter table admin_users enable row level security;

-- Public storefront can read the catalog; only logged-in admin/staff can write.
create policy "public read categories" on categories for select using (true);
create policy "admin write categories" on categories for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read products" on products for select using (true);
create policy "admin write products" on products for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "public read product_variants" on product_variants for select using (true);
create policy "admin write product_variants" on product_variants for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Everything else (orders, customers, promotions, inventory logs, admin
-- accounts) is admin/staff-only — no public storefront access at all, since
-- there's no separate real customer-account system yet.
create policy "admin only customers" on customers for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin only orders" on orders for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin only order_items" on order_items for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin only promotions" on promotions for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin only inventory_logs" on inventory_logs for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin only admin_users" on admin_users for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ── STORAGE: product images ─────────────────────────────────
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "public read product-images" on storage.objects for select
  using (bucket_id = 'product-images');

create policy "admin upload product-images" on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "admin update product-images" on storage.objects for update
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "admin delete product-images" on storage.objects for delete
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

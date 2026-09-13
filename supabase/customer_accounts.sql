-- Adds real customer accounts (Supabase Auth-backed), saved addresses, and
-- wishlists. Run this once in the Supabase SQL Editor, AFTER order_fulfillment.sql.
--
-- ============================================================================
-- IMPORTANT — this also FIXES a pre-existing RLS security hole in schema.sql:
-- the "admin only ..." policies on customers/orders/order_items/promotions/
-- inventory_logs/admin_users all gate on `auth.role() = 'authenticated'`,
-- which is true for ANY logged-in Supabase Auth user — not just admin/staff.
-- Until now that was harmless because only admin/staff ever had Auth
-- accounts. The moment customers get their own accounts (this migration),
-- that same policy would let any signed-up customer read and WRITE every
-- other customer's PII, every order, every admin account. This migration
-- replaces those policies with ones that actually check admin_users
-- membership, before adding scoped customer-only access alongside them.
-- ============================================================================

-- ── FIX: admin-only tables now require real admin_users membership ─────────
-- Checking admin status with an inline `exists (select 1 from admin_users
-- ...)` works fine on OTHER tables, but a policy ON admin_users itself using
-- that same pattern causes infinite recursion (checking admin_users requires
-- re-checking admin_users, forever — Postgres error 42P17). A SECURITY
-- DEFINER function breaks the loop: it runs with the privileges of whoever
-- created it (the table owner, via the SQL Editor), which bypasses RLS for
-- its internal query.
create or replace function is_active_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from admin_users where id = auth.uid() and active);
$$;

drop policy if exists "admin only customers" on customers;
drop policy if exists "admin only orders" on orders;
drop policy if exists "admin only order_items" on order_items;
drop policy if exists "admin only promotions" on promotions;
drop policy if exists "admin only inventory_logs" on inventory_logs;
drop policy if exists "admin only admin_users" on admin_users;

create policy "admin manage customers" on customers for all
  using (is_active_admin()) with check (is_active_admin());

create policy "admin manage orders" on orders for all
  using (is_active_admin()) with check (is_active_admin());

create policy "admin manage order_items" on order_items for all
  using (is_active_admin()) with check (is_active_admin());

create policy "admin manage promotions" on promotions for all
  using (is_active_admin()) with check (is_active_admin());

create policy "admin manage inventory_logs" on inventory_logs for all
  using (is_active_admin()) with check (is_active_admin());

create policy "admin manage admin_users" on admin_users for all
  using (is_active_admin()) with check (is_active_admin());

-- ── CUSTOMERS: link to Supabase Auth + member profile fields ───────────────
alter table customers add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null;
alter table customers add column if not exists shoe_size_preference text not null default '';

create policy "customers read own profile" on customers for select
  using (auth_user_id = auth.uid());

create policy "customers update own profile" on customers for update
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- A customer can create their OWN row only (auth_user_id must be their own
-- uid) — this is what runs at signup, before any admin policy would apply.
create policy "customers create own profile" on customers for insert
  with check (auth_user_id = auth.uid());

-- ── CUSTOMERS: scoped read access to their own orders ───────────────────────
create policy "customers read own orders" on orders for select
  using (customer_id in (select id from customers where auth_user_id = auth.uid()));

create policy "customers read own order_items" on order_items for select
  using (
    order_id in (
      select o.id from orders o
      join customers c on c.id = o.customer_id
      where c.auth_user_id = auth.uid()
    )
  );

-- ── SAVED ADDRESSES ──────────────────────────────────────────────────────
create table if not exists customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  label text not null default 'Home',
  recipient_name text not null,
  phone text not null,
  street text not null,
  barangay_code text not null default '',
  barangay_name text not null default '',
  city_code text not null default '',
  city_name text not null,
  province_code text not null default '',
  province_name text not null default '',
  region_code text not null default '',
  region_name text not null default '',
  zip text not null default '',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

alter table customer_addresses enable row level security;

create policy "customers manage own addresses" on customer_addresses for all
  using (customer_id in (select id from customers where auth_user_id = auth.uid()))
  with check (customer_id in (select id from customers where auth_user_id = auth.uid()));

create policy "admin read addresses" on customer_addresses for select
  using (is_active_admin());

-- ── WISHLIST ─────────────────────────────────────────────────────────────
create table if not exists wishlist_items (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_id, product_id)
);

alter table wishlist_items enable row level security;

create policy "customers manage own wishlist" on wishlist_items for all
  using (customer_id in (select id from customers where auth_user_id = auth.uid()))
  with check (customer_id in (select id from customers where auth_user_id = auth.uid()));

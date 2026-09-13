-- Fixes "infinite recursion detected in policy for relation admin_users"
-- (Postgres error 42P17), introduced by customer_accounts.sql.
--
-- The bug: every "admin manage ..." policy checked admin status with an
-- inline subquery — exists (select 1 from admin_users a where a.id =
-- auth.uid() and a.active). That's fine on tables OTHER than admin_users.
-- But the policy ON admin_users itself used the exact same pattern, which
-- means "to read admin_users, first read admin_users" — and since RLS
-- re-applies to that inner subquery too, Postgres loops forever. Any query
-- that needs to check admin status (which is every "admin manage ..." policy
-- on every table) hits this the moment it touches admin_users.
--
-- Fix: move the check into a SECURITY DEFINER function. Such a function runs
-- with the privileges of whoever created it (the table owner, via the SQL
-- Editor) rather than the calling user, which bypasses RLS for its internal
-- query — breaking the recursion. Run this once in the Supabase SQL Editor.

create or replace function is_active_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from admin_users where id = auth.uid() and active);
$$;

drop policy if exists "admin manage customers" on customers;
drop policy if exists "admin manage orders" on orders;
drop policy if exists "admin manage order_items" on order_items;
drop policy if exists "admin manage promotions" on promotions;
drop policy if exists "admin manage inventory_logs" on inventory_logs;
drop policy if exists "admin manage admin_users" on admin_users;
drop policy if exists "admin read addresses" on customer_addresses;

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

create policy "admin read addresses" on customer_addresses for select
  using (is_active_admin());

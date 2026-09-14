-- Links promo codes to the specific order they were applied to (previously
-- promotions existed but nothing recorded which order used which code). Run
-- this once in the Supabase SQL Editor.

alter table orders add column if not exists promotion_id uuid references promotions(id) on delete set null;
alter table orders add column if not exists discount_amount numeric not null default 0;

-- Atomic +1 so two simultaneous checkouts with the same code can't clobber
-- each other's count with a stale read-then-write from the server.
create or replace function increment_promotion_usage(promo_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update promotions set usage_count = usage_count + 1 where id = promo_id;
$$;

-- Adds the customer-contact and shipment-tracking columns the checkout and
-- admin fulfillment flow need. Run this once in the Supabase SQL Editor.

alter table orders add column if not exists customer_phone text not null default '';
alter table orders add column if not exists tracking_number text;
alter table orders add column if not exists courier text not null default 'J&T Express';
alter table orders add column if not exists shipped_at timestamptz;

-- server.ts has always tried to save this column on checkout-session
-- creation, but it was never actually added to this project's database —
-- that update call has been silently failing on every checkout. Adding it
-- now so PayMongo checkout-session IDs actually get recorded.
alter table orders add column if not exists paymongo_checkout_session_id text;
create index if not exists orders_paymongo_checkout_session_id_idx on orders (paymongo_checkout_session_id);

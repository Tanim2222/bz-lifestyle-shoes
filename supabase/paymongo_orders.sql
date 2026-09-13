-- Adds the columns PayMongo checkout needs to the existing orders table.
-- Run this once in the Supabase SQL Editor.

alter table orders add column if not exists customer_email text not null default '';
alter table orders add column if not exists paymongo_checkout_session_id text;

create index if not exists orders_paymongo_checkout_session_id_idx on orders (paymongo_checkout_session_id);

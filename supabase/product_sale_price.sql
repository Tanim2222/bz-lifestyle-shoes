-- Adds a real "compare-at" (original) price so the storefront can show a
-- genuine sale badge with old/new price, instead of the placeholder
-- index-based badge that used to fake it. Null/unset means "not on sale".
-- Run this once in the Supabase SQL Editor.

alter table products add column if not exists compare_at_price numeric;

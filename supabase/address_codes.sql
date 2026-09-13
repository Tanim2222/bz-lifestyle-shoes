-- Adds PSGC location codes to saved addresses. Run this once in the
-- Supabase SQL Editor.
--
-- customer_addresses previously stored only the human-readable region/
-- province/city/barangay NAMES, not their PSGC codes. That's enough to
-- format a shipping address string, but the cascading Region -> Province ->
-- City -> Barangay dropdowns in the UI select by CODE, not name — so
-- loading a saved address back into the checkout form left those dropdowns
-- showing blank placeholders even though the underlying address was
-- correct. Storing the codes lets the form properly re-select them.

alter table customer_addresses add column if not exists region_code text not null default '';
alter table customer_addresses add column if not exists province_code text not null default '';
alter table customer_addresses add column if not exists city_code text not null default '';
alter table customer_addresses add column if not exists barangay_code text not null default '';

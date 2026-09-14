-- "Shop Now"/"Shop the Sale"/etc. CTAs previously pointed to '#featured',
-- which only scrolls to the New Arrivals strip on the homepage instead of a
-- real, filterable catalog. Repoints any of those (and any you've since
-- added the same way) to the new /shop page. Safe to re-run. Run this once
-- in the Supabase SQL Editor.

update hero_slides set cta_href = '/shop' where cta_href = '#featured';
update promo_banners set href = '/shop' where href = '#featured';

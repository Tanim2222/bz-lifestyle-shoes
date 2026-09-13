-- Seeds the landing page tables with the same content that used to be
-- hardcoded in src/data/heroSlides.ts, categories.ts, promos.ts — so the
-- storefront isn't empty right after running landing_content.sql. Admin can
-- edit/replace all of this from Admin → Landing Page.

insert into hero_slides (eyebrow, title, subtitle, cta_label, cta_href, is_3d, accent_color, sort_order) values
  ('New Drop', 'Aero-Stride v2 just landed', 'Bio-adaptive cushioning built for everyday speed. Grab yours before sizes run out.', 'Shop Now', '#featured', false, 'teal', 0),
  ('Interactive', 'Explore every layer in 3D', 'Rotate, zoom, and inspect the full build before you commit to a pair.', 'Launch 3D Viewer', '#explore-3d', true, 'fuchsia', 1),
  ('Limited Time', 'Up to 40% off select styles', 'Members get first pick of every markdown drop, 24 hours early.', 'Shop the Sale', '#featured', false, 'red', 2),
  ('BZ Rewards', 'Join and unlock exclusive drops', 'Earn points on every order, redeem for gear, and skip the line on release day.', 'Join Free', '#membership', false, 'amber', 3);

insert into shop_categories (label, href, sort_order) values
  ('Basketball', '#shop-by-category', 0),
  ('Running', '#shop-by-category', 1),
  ('Lifestyle', '#shop-by-category', 2),
  ('Skate', '#shop-by-category', 3);

insert into promo_banners (title, copy, cta_label, href, accent_color, sort_order) values
  ('New Arrivals', 'Fresh drops every week — be first to cop.', 'Shop New', '#featured', 'teal', 0),
  ('Members Exclusive', 'Early access, bonus points, and birthday perks.', 'Join Now', '#membership', 'fuchsia', 1),
  ('Up to 40% Off', 'Selected styles, while stocks last.', 'Shop Sale', '#featured', 'red', 2),
  ('Extra 10% Off', 'Use code BZAPP10 at checkout — new customers only.', 'Get the Code', '#featured', 'cyan', 3);

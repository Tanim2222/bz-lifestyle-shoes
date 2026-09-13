-- Sample data — run once after schema.sql, in the Supabase SQL Editor.
-- Reuses the same demo catalog/orders that shipped with the mock version.

-- ── CATEGORIES ──────────────────────────────────────────────
insert into categories (id, name, slug, description) values
  ('11111111-1111-1111-1111-111111111101', 'Performance', 'performance', 'Engineered for training and race day.'),
  ('11111111-1111-1111-1111-111111111102', 'Originals', 'originals', 'Everyday lifestyle silhouettes.'),
  ('11111111-1111-1111-1111-111111111103', 'Trail', 'trail', 'Built for off-road grip and durability.'),
  ('11111111-1111-1111-1111-111111111104', 'Lifestyle', 'lifestyle', 'Casual comfort for daily wear.');

-- ── PRODUCTS ────────────────────────────────────────────────
-- Placeholder photo reused for every seed product — replace via Admin →
-- Products → Upload Image / Generate with AI once you're connected.
insert into products (id, name, category_id, price, description, image_url, colorway, active) values
  ('22222222-2222-2222-2222-222222222201', 'Aero-Stride v2', '11111111-1111-1111-1111-111111111101', 9000, 'Bio-adaptive foam running shoe with dynamic fit weave.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600', 'Electric Teal', true),
  ('22222222-2222-2222-2222-222222222202', 'Aero-Stride v2', '11111111-1111-1111-1111-111111111101', 9000, 'Bio-adaptive foam running shoe with dynamic fit weave.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600', 'Crimson Flame', true),
  ('22222222-2222-2222-2222-222222222203', 'Aero-Stride v2', '11111111-1111-1111-1111-111111111101', 11000, 'Bio-adaptive foam running shoe with dynamic fit weave.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600', 'Carbon Obsidian', true),
  ('22222222-2222-2222-2222-222222222204', 'Aero-Stride Low', '11111111-1111-1111-1111-111111111102', 9500, 'Low-top everyday silhouette with the same signature cushioning.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600', 'Arctic White', true),
  ('22222222-2222-2222-2222-222222222205', 'Aero-Stride Trail', '11111111-1111-1111-1111-111111111103', 11000, 'Multi-surface outsole pattern engineered for grip on any terrain.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600', 'Volt Green', true),
  ('22222222-2222-2222-2222-222222222206', 'Aero-Stride Knit', '11111111-1111-1111-1111-111111111102', 9000, 'Zero-waste knit upper that adapts to your foot shape within 3 strides.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600', 'Midnight Navy', true),
  ('22222222-2222-2222-2222-222222222207', 'Aero-Stride Pulse', '11111111-1111-1111-1111-111111111104', 8500, 'Lightweight lifestyle build for all-day comfort.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600', 'Sunset Orange', true),
  ('22222222-2222-2222-2222-222222222208', 'Aero-Stride Glide', '11111111-1111-1111-1111-111111111101', 9800, 'Carbon kinetic plate for propulsive energy return.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600', 'Storm Grey', false);

-- ── PRODUCT VARIANTS (sizes & stock) ────────────────────────
insert into product_variants (product_id, size, stock) values
  ('22222222-2222-2222-2222-222222222201','US 8',4), ('22222222-2222-2222-2222-222222222201','US 8.5',6), ('22222222-2222-2222-2222-222222222201','US 9',10), ('22222222-2222-2222-2222-222222222201','US 9.5',14), ('22222222-2222-2222-2222-222222222201','US 10',12), ('22222222-2222-2222-2222-222222222201','US 11',8), ('22222222-2222-2222-2222-222222222201','US 12',3),
  ('22222222-2222-2222-2222-222222222202','US 8',2), ('22222222-2222-2222-2222-222222222202','US 8.5',5), ('22222222-2222-2222-2222-222222222202','US 9',9), ('22222222-2222-2222-2222-222222222202','US 9.5',11), ('22222222-2222-2222-2222-222222222202','US 10',10), ('22222222-2222-2222-2222-222222222202','US 11',6), ('22222222-2222-2222-2222-222222222202','US 12',0),
  ('22222222-2222-2222-2222-222222222203','US 8',8), ('22222222-2222-2222-2222-222222222203','US 8.5',8), ('22222222-2222-2222-2222-222222222203','US 9',12), ('22222222-2222-2222-2222-222222222203','US 9.5',15), ('22222222-2222-2222-2222-222222222203','US 10',13), ('22222222-2222-2222-2222-222222222203','US 11',9), ('22222222-2222-2222-2222-222222222203','US 12',5),
  ('22222222-2222-2222-2222-222222222204','US 8',3), ('22222222-2222-2222-2222-222222222204','US 8.5',4), ('22222222-2222-2222-2222-222222222204','US 9',7), ('22222222-2222-2222-2222-222222222204','US 9.5',9), ('22222222-2222-2222-2222-222222222204','US 10',8), ('22222222-2222-2222-2222-222222222204','US 11',4), ('22222222-2222-2222-2222-222222222204','US 12',2),
  ('22222222-2222-2222-2222-222222222205','US 8',6), ('22222222-2222-2222-2222-222222222205','US 8.5',7), ('22222222-2222-2222-2222-222222222205','US 9',11), ('22222222-2222-2222-2222-222222222205','US 9.5',12), ('22222222-2222-2222-2222-222222222205','US 10',10), ('22222222-2222-2222-2222-222222222205','US 11',7), ('22222222-2222-2222-2222-222222222205','US 12',4),
  ('22222222-2222-2222-2222-222222222206','US 8',1), ('22222222-2222-2222-2222-222222222206','US 8.5',2), ('22222222-2222-2222-2222-222222222206','US 9',3), ('22222222-2222-2222-2222-222222222206','US 9.5',5), ('22222222-2222-2222-2222-222222222206','US 10',4), ('22222222-2222-2222-2222-222222222206','US 11',2), ('22222222-2222-2222-2222-222222222206','US 12',0),
  ('22222222-2222-2222-2222-222222222207','US 8',5), ('22222222-2222-2222-2222-222222222207','US 8.5',6), ('22222222-2222-2222-2222-222222222207','US 9',9), ('22222222-2222-2222-2222-222222222207','US 9.5',10), ('22222222-2222-2222-2222-222222222207','US 10',8), ('22222222-2222-2222-2222-222222222207','US 11',5), ('22222222-2222-2222-2222-222222222207','US 12',3),
  ('22222222-2222-2222-2222-222222222208','US 8',0), ('22222222-2222-2222-2222-222222222208','US 8.5',1), ('22222222-2222-2222-2222-222222222208','US 9',2), ('22222222-2222-2222-2222-222222222208','US 9.5',3), ('22222222-2222-2222-2222-222222222208','US 10',2), ('22222222-2222-2222-2222-222222222208','US 11',1), ('22222222-2222-2222-2222-222222222208','US 12',0);

-- ── CUSTOMERS ───────────────────────────────────────────────
insert into customers (id, name, email, phone, joined_at, total_orders, total_spent) values
  ('33333333-3333-3333-3333-333333333301', 'Juan Dela Cruz', 'juan.delacruz@example.com', '+63 917 123 4567', '2025-11-02', 3, 28500),
  ('33333333-3333-3333-3333-333333333302', 'Maria Santos', 'maria.santos@example.com', '+63 918 234 5678', '2025-12-14', 2, 20000),
  ('33333333-3333-3333-3333-333333333303', 'John Reyes', 'john.reyes@example.com', '+63 919 345 6789', '2026-01-20', 1, 9000),
  ('33333333-3333-3333-3333-333333333304', 'Angela Cruz', 'angela.cruz@example.com', '+63 920 456 7890', '2026-03-05', 2, 19500),
  ('33333333-3333-3333-3333-333333333305', 'Mark Villanueva', 'mark.villanueva@example.com', '+63 921 567 8901', '2026-05-11', 1, 11000),
  ('33333333-3333-3333-3333-333333333306', 'Kevin Tan', 'kevin.tan@example.com', '+63 922 678 9012', '2026-06-28', 1, 8500);

-- ── ORDERS + ITEMS ──────────────────────────────────────────
insert into orders (id, order_number, customer_id, customer_name, status, subtotal, shipping_fee, total, shipping_address, payment_method, created_at) values
  ('44444444-4444-4444-4444-444444444401', 'BZ-10231', '33333333-3333-3333-3333-333333333301', 'Juan Dela Cruz', 'completed', 9000, 150, 9150, '123 Mabini St, Makati City, Metro Manila', 'GCash', '2026-05-01'),
  ('44444444-4444-4444-4444-444444444402', 'BZ-10232', '33333333-3333-3333-3333-333333333302', 'Maria Santos', 'shipped', 9500, 150, 9650, '45 Rizal Ave, Quezon City, Metro Manila', 'Credit Card', '2026-06-10'),
  ('44444444-4444-4444-4444-444444444403', 'BZ-10233', '33333333-3333-3333-3333-333333333303', 'John Reyes', 'processing', 9000, 150, 9150, '78 Bonifacio St, Cebu City, Cebu', 'COD', '2026-06-18'),
  ('44444444-4444-4444-4444-444444444404', 'BZ-10234', '33333333-3333-3333-3333-333333333304', 'Angela Cruz', 'paid', 11000, 150, 11150, '12 Katipunan Ave, Quezon City, Metro Manila', 'GCash', '2026-06-20'),
  ('44444444-4444-4444-4444-444444444405', 'BZ-10235', '33333333-3333-3333-3333-333333333301', 'Juan Dela Cruz', 'pending', 18000, 150, 18150, '123 Mabini St, Makati City, Metro Manila', 'Bank Transfer', '2026-06-22'),
  ('44444444-4444-4444-4444-444444444406', 'BZ-10236', '33333333-3333-3333-3333-333333333305', 'Mark Villanueva', 'cancelled', 11000, 150, 11150, '9 Session Rd, Baguio City, Benguet', 'Credit Card', '2026-06-14'),
  ('44444444-4444-4444-4444-444444444407', 'BZ-10237', '33333333-3333-3333-3333-333333333306', 'Kevin Tan', 'completed', 8500, 150, 8650, '56 Osmeña Blvd, Cebu City, Cebu', 'GCash', '2026-06-05'),
  ('44444444-4444-4444-4444-444444444408', 'BZ-10238', '33333333-3333-3333-3333-333333333302', 'Maria Santos', 'shipped', 9000, 150, 9150, '45 Rizal Ave, Quezon City, Metro Manila', 'GCash', '2026-06-21'),
  ('44444444-4444-4444-4444-444444444409', 'BZ-10239', '33333333-3333-3333-3333-333333333304', 'Angela Cruz', 'processing', 9500, 150, 9650, '12 Katipunan Ave, Quezon City, Metro Manila', 'COD', '2026-06-23'),
  ('44444444-4444-4444-4444-444444444410', 'BZ-10240', '33333333-3333-3333-3333-333333333303', 'John Reyes', 'pending', 11000, 150, 11150, '78 Bonifacio St, Cebu City, Cebu', 'Bank Transfer', '2026-06-24');

insert into order_items (order_id, product_id, product_name, size, quantity, unit_price) values
  ('44444444-4444-4444-4444-444444444401', '22222222-2222-2222-2222-222222222201', 'Aero-Stride v2 Electric Teal', 'US 9.5', 1, 9000),
  ('44444444-4444-4444-4444-444444444402', '22222222-2222-2222-2222-222222222204', 'Aero-Stride Low Arctic White', 'US 8', 1, 9500),
  ('44444444-4444-4444-4444-444444444403', '22222222-2222-2222-2222-222222222202', 'Aero-Stride v2 Crimson Flame', 'US 10', 1, 9000),
  ('44444444-4444-4444-4444-444444444404', '22222222-2222-2222-2222-222222222205', 'Aero-Stride Trail Volt Green', 'US 9', 1, 11000),
  ('44444444-4444-4444-4444-444444444405', '22222222-2222-2222-2222-222222222206', 'Aero-Stride Knit Midnight Navy', 'US 9.5', 2, 9000),
  ('44444444-4444-4444-4444-444444444406', '22222222-2222-2222-2222-222222222203', 'Aero-Stride v2 Carbon Obsidian', 'US 11', 1, 11000),
  ('44444444-4444-4444-4444-444444444407', '22222222-2222-2222-2222-222222222207', 'Aero-Stride Pulse Sunset Orange', 'US 9', 1, 8500),
  ('44444444-4444-4444-4444-444444444408', '22222222-2222-2222-2222-222222222201', 'Aero-Stride v2 Electric Teal', 'US 8.5', 1, 9000),
  ('44444444-4444-4444-4444-444444444409', '22222222-2222-2222-2222-222222222204', 'Aero-Stride Low Arctic White', 'US 10', 1, 9500),
  ('44444444-4444-4444-4444-444444444410', '22222222-2222-2222-2222-222222222205', 'Aero-Stride Trail Volt Green', 'US 11', 1, 11000);

-- ── PROMOTIONS ──────────────────────────────────────────────
insert into promotions (code, description, discount_type, value, start_date, end_date, active, usage_count) values
  ('WELCOME10', '10% off for first-time customers', 'percentage', 10, '2026-01-01', '2026-12-31', true, 42),
  ('FLASH500', '₱500 off orders over ₱9,000', 'fixed', 500, '2026-06-01', '2026-07-31', true, 18),
  ('SUMMER20', '20% off summer collection', 'percentage', 20, '2026-03-01', '2026-05-31', false, 96);

-- ── INVENTORY LOGS ──────────────────────────────────────────
insert into inventory_logs (product_id, product_name, size, change, resulting_stock, reason, adjusted_by, created_at) values
  ('22222222-2222-2222-2222-222222222201', 'Aero-Stride v2 Electric Teal', 'US 9.5', 20, 14, 'Restock from supplier', 'BZ Admin', '2026-06-01'),
  ('22222222-2222-2222-2222-222222222206', 'Aero-Stride Knit Midnight Navy', 'US 12', -1, 0, 'Damaged unit removed', 'Staff Member', '2026-06-10'),
  ('22222222-2222-2222-2222-222222222208', 'Aero-Stride Glide Storm Grey', 'US 8', -2, 0, 'Stock count correction', 'BZ Admin', '2026-06-15'),
  ('22222222-2222-2222-2222-222222222202', 'Aero-Stride v2 Crimson Flame', 'US 12', -3, 0, 'Sold at pop-up event', 'Staff Member', '2026-06-19'),
  ('22222222-2222-2222-2222-222222222203', 'Aero-Stride v2 Carbon Obsidian', 'US 8', 8, 8, 'Restock from supplier', 'BZ Admin', '2026-06-22');

-- ── ADMIN USER (manual step) ────────────────────────────────
-- 1. Go to Authentication → Users → Add user, create e.g. admin@bzlifestyle.com
--    with a password (check "Auto Confirm User").
-- 2. Copy that user's UUID from the Users table.
-- 3. Uncomment and run the line below with that UUID:
--
-- insert into admin_users (id, name, email, role, active) values
--   ('paste-the-auth-user-uuid-here', 'BZ Admin', 'admin@bzlifestyle.com', 'admin', true);

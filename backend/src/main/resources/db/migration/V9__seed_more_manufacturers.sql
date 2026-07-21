-- Two more manufacturers with their own products and real photography, so the
-- "Top Manufacturers" directory and manufacturer profile page aren't a
-- single-entry list. Password for both: "Password1!" (same demo hash as V4).
INSERT INTO users (id, email, password_hash, full_name, business_name, role, phone, city, verified, dark_mode, created_at)
VALUES
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'volta@zyntra.dev', '$2b$10$D17jTgZz8QfTk1S0UzmGx.AmZRGbGJKMnLmuwmtiIv2jTITpUVkmC', 'Efo Mensah', 'Volta Textile Mills', 'MANUFACTURER', '+233244000003', 'Ho', true, false, now() - interval '70 days'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'tema@zyntra.dev', '$2b$10$D17jTgZz8QfTk1S0UzmGx.AmZRGbGJKMnLmuwmtiIv2jTITpUVkmC', 'Yaw Osei', 'Tema Steelworks', 'MANUFACTURER', '+233244000004', 'Tema', true, false, now() - interval '65 days');

INSERT INTO products (id, manufacturer_id, name, sku, category, description, image_url, base_unit_price, unit, moq, stock_qty, low_stock_threshold, lead_time_days_min, lead_time_days_max, active, created_at)
VALUES
  ('c0000000-0000-4000-8000-000000000007', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Cotton Fabric Rolls (100m roll)', 'COTT-100M', 'Textiles', 'Woven cotton fabric, 100m rolls, ready for garment production.', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop', 620.00, 'rolls', 3, 90, 15, 4, 6, true, now() - interval '68 days'),
  ('c0000000-0000-4000-8000-000000000008', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Ankara Print Bundles (50yd bundle)', 'ANK-50YD', 'Textiles', 'Wax-print Ankara fabric bundles in mixed patterns.', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80&auto=format&fit=crop', 480.00, 'bundles', 4, 140, 20, 3, 5, true, now() - interval '66 days'),
  ('c0000000-0000-4000-8000-000000000009', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Kente-Weave Trim (200m spool)', 'KENT-200M', 'Textiles', 'Handloom-style Kente trim for garment and accessory finishing.', 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80&auto=format&fit=crop', 340.00, 'spools', 5, 60, 10, 5, 8, true, now() - interval '64 days'),

  ('c0000000-0000-4000-8000-000000000010', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'Galvanized Roofing Sheets (3m sheet)', 'ROOF-3M', 'Metals', 'Corrugated galvanized steel roofing sheets, rust-resistant coating.', 'https://images.unsplash.com/photo-1610383440071-c40a3ab5f9a2?w=800&q=80&auto=format&fit=crop', 165.00, 'sheets', 20, 800, 100, 3, 5, true, now() - interval '63 days'),
  ('c0000000-0000-4000-8000-000000000011', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'Reinforcement Steel Bars (12mm, 12m length)', 'REBAR-12MM', 'Metals', 'High-tensile reinforcement bars for concrete construction.', 'https://images.unsplash.com/photo-1541976590-713941681591?w=800&q=80&auto=format&fit=crop', 210.00, 'lengths', 15, 600, 80, 4, 7, true, now() - interval '61 days'),
  ('c0000000-0000-4000-8000-000000000012', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'Aluminium Window Profiles (6m length)', 'ALUM-6M', 'Building', 'Extruded aluminium profiles for window and door framing.', 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80&auto=format&fit=crop', 275.00, 'lengths', 10, 320, 40, 5, 8, true, now() - interval '60 days');

INSERT INTO price_tiers (id, product_id, min_qty, max_qty, unit_price) VALUES
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000007', 3, 14, 600.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000007', 15, 49, 570.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000007', 50, NULL, 540.00),

  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000008', 4, 19, 460.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000008', 20, 79, 435.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000008', 80, NULL, 410.00),

  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000009', 5, 24, 325.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000009', 25, NULL, 300.00),

  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000010', 20, 99, 158.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000010', 100, 399, 149.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000010', 400, NULL, 140.00),

  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000011', 15, 79, 202.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000011', 80, 299, 192.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000011', 300, NULL, 182.00),

  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000012', 10, 49, 265.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000012', 50, NULL, 248.00);

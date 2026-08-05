-- Broadens the demo catalog beyond Ashanti AgroWorks' single-manufacturer
-- agro-products set: three more manufacturers across genuinely distinct
-- categories (textiles, construction materials, beverages), each with a
-- realistic product line and price tiers. Same demo password as V15
-- ("Password1!") so these accounts are usable for manual testing too.

INSERT INTO users (id, email, password_hash, full_name, business_name, role, phone, city, verified, dark_mode, created_at)
VALUES
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'volta@zyntra.dev', '$2b$10$D17jTgZz8QfTk1S0UzmGx.AmZRGbGJKMnLmuwmtiIv2jTITpUVkmC', 'Efo Mensah', 'Volta Textiles Ltd', 'MANUFACTURER', '+233244000003', 'Ho', true, false, now() - interval '60 days'),
  ('ffffffff-ffff-4fff-8fff-ffffffffffff', 'tema@zyntra.dev', '$2b$10$D17jTgZz8QfTk1S0UzmGx.AmZRGbGJKMnLmuwmtiIv2jTITpUVkmC', 'Kojo Adjei', 'Tema Construction Supplies', 'MANUFACTURER', '+233244000004', 'Tema', true, false, now() - interval '45 days'),
  ('11111111-1111-4111-8111-111111111111', 'accra-bev@zyntra.dev', '$2b$10$D17jTgZz8QfTk1S0UzmGx.AmZRGbGJKMnLmuwmtiIv2jTITpUVkmC', 'Abena Osei', 'Accra Beverage Works', 'MANUFACTURER', '+233244000005', 'Accra', false, false, now() - interval '20 days');

INSERT INTO products (id, manufacturer_id, name, sku, category, description, image_url, base_unit_price, unit, moq, stock_qty, low_stock_threshold, lead_time_days_min, lead_time_days_max, active, created_at)
VALUES
  -- Volta Textiles Ltd
  ('c0000000-0000-4000-8000-000000000013', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Cotton Fabric Rolls (100m roll)', 'COTT-100M-V2', 'Textiles', 'Woven cotton fabric, 100m rolls, ready for garment production.', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop', 520.00, 'rolls', 3, 60, 10, 5, 8, true, now() - interval '58 days'),
  ('c0000000-0000-4000-8000-000000000014', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Ankara Print Bundles (50yd bundle)', 'ANK-50YD-V2', 'Textiles', 'Wax-print Ankara fabric bundles in mixed patterns.', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80&auto=format&fit=crop', 460.00, 'bundles', 4, 90, 15, 4, 7, true, now() - interval '57 days'),
  ('c0000000-0000-4000-8000-000000000015', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'School Uniform Cloth (40m bolt)', 'UNIF-40M', 'Textiles', 'Durable poly-cotton blend, standard uniform colors.', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80&auto=format&fit=crop', 310.00, 'bolts', 5, 70, 12, 4, 6, true, now() - interval '55 days'),

  -- Tema Construction Supplies
  ('c0000000-0000-4000-8000-000000000016', 'ffffffff-ffff-4fff-8fff-ffffffffffff', 'Portland Cement (50kg bag)', 'CEM-50KG', 'Construction', 'General-purpose Portland cement for structural and finishing work.', 'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?w=800&q=80&auto=format&fit=crop', 68.00, 'bags', 50, 2000, 200, 2, 4, true, now() - interval '44 days'),
  ('c0000000-0000-4000-8000-000000000017', 'ffffffff-ffff-4fff-8fff-ffffffffffff', 'Reinforcement Iron Rods (12mm x 12m)', 'IRON-12MM', 'Construction', 'High-tensile deformed steel rebar for concrete reinforcement.', 'https://images.unsplash.com/photo-1541976590-713941681591?w=800&q=80&auto=format&fit=crop', 145.00, 'pieces', 20, 800, 100, 3, 6, true, now() - interval '42 days'),
  ('c0000000-0000-4000-8000-000000000018', 'ffffffff-ffff-4fff-8fff-ffffffffffff', 'Aluzinc Roofing Sheets (3m)', 'ROOF-3M', 'Construction', 'Corrosion-resistant aluzinc roofing sheets, standard corrugated profile.', 'https://images.unsplash.com/photo-1632759145351-1d592919f522?w=800&q=80&auto=format&fit=crop', 210.00, 'sheets', 15, 400, 60, 4, 7, true, now() - interval '40 days'),

  -- Accra Beverage Works
  ('c0000000-0000-4000-8000-000000000019', '11111111-1111-4111-8111-111111111111', 'Bottled Water (1.5L, 12-pack)', 'WATER-12PK', 'Beverages', 'Purified bottled water, shrink-wrapped 12-packs for retail resale.', 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=800&q=80&auto=format&fit=crop', 24.00, 'packs', 100, 3000, 300, 2, 3, true, now() - interval '19 days'),
  ('c0000000-0000-4000-8000-000000000020', '11111111-1111-4111-8111-111111111111', 'Malt Drink (330ml, 24-pack crate)', 'MALT-24PK', 'Beverages', 'Non-alcoholic malt beverage, 330ml cans in 24-pack crates.', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80&auto=format&fit=crop', 96.00, 'crates', 40, 900, 100, 3, 5, true, now() - interval '17 days'),
  ('c0000000-0000-4000-8000-000000000021', '11111111-1111-4111-8111-111111111111', 'Fruit Juice Concentrate (5L jug)', 'JUICE-5L', 'Beverages', 'Mixed-fruit concentrate for dilution, bulk food-service jugs.', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80&auto=format&fit=crop', 140.00, 'jugs', 30, 500, 80, 3, 5, true, now() - interval '15 days');

INSERT INTO price_tiers (id, product_id, min_qty, max_qty, unit_price) VALUES
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000013', 3, 9, 500.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000013', 10, 29, 475.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000013', 30, NULL, 450.00),

  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000014', 4, 11, 440.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000014', 12, 39, 420.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000014', 40, NULL, 395.00),

  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000015', 5, 14, 300.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000015', 15, 49, 285.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000015', 50, NULL, 270.00),

  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000016', 50, 199, 65.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000016', 200, 999, 61.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000016', 1000, NULL, 57.00),

  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000017', 20, 79, 140.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000017', 80, 299, 132.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000017', 300, NULL, 124.00),

  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000018', 15, 49, 205.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000018', 50, 149, 195.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000018', 150, NULL, 185.00),

  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000019', 100, 299, 23.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000019', 300, 999, 21.50),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000019', 1000, NULL, 20.00),

  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000020', 40, 119, 92.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000020', 120, 399, 87.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000020', 400, NULL, 82.00),

  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000021', 30, 79, 136.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000021', 80, 199, 128.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000021', 200, NULL, 120.00);

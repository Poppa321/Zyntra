-- Demo accounts (password for both: "Password1!", BCrypt cost 10)
INSERT INTO users (id, email, password_hash, full_name, business_name, role, phone, city, verified, dark_mode, created_at)
VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'maker@zyntra.dev', '$2b$10$D17jTgZz8QfTk1S0UzmGx.AmZRGbGJKMnLmuwmtiIv2jTITpUVkmC', 'Kwame Boateng', 'Ashanti AgroWorks', 'MANUFACTURER', '+233244000001', 'Kumasi', true, false, now() - interval '90 days'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'buyer@zyntra.dev', '$2b$10$D17jTgZz8QfTk1S0UzmGx.AmZRGbGJKMnLmuwmtiIv2jTITpUVkmC', 'Ama Serwaa', 'Kumasi Distributors', 'DISTRIBUTOR', '+233244000002', 'Kumasi', true, false, now() - interval '80 days');

-- Products (6, across categories, each with 3 price tiers)
INSERT INTO products (id, manufacturer_id, name, sku, category, description, image_url, base_unit_price, unit, moq, stock_qty, low_stock_threshold, lead_time_days_min, lead_time_days_max, active, created_at)
VALUES
  ('c0000000-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Premium Jasmine Rice (25kg bag)', 'RICE-25KG', 'Grains', 'Long-grain jasmine rice, milled and packed for bulk distribution.', 'https://picsum.photos/seed/rice/400', 180.00, 'bags', 10, 500, 50, 2, 4, true, now() - interval '85 days'),
  ('c0000000-0000-4000-8000-000000000002', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Cassava Flour (50kg sack)', 'CASV-50KG', 'Flour', 'Finely milled cassava flour, sun-dried and sifted.', 'https://picsum.photos/seed/cassava/400', 220.00, 'sacks', 5, 300, 40, 3, 5, true, now() - interval '84 days'),
  ('c0000000-0000-4000-8000-000000000003', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Palm Oil (25L jerrycan)', 'PALM-25L', 'Oils', 'Cold-pressed red palm oil, unrefined.', 'https://picsum.photos/seed/palmoil/400', 450.00, 'jerrycans', 4, 200, 30, 2, 3, true, now() - interval '83 days'),
  ('c0000000-0000-4000-8000-000000000004', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Cocoa Beans (60kg bag)', 'COCOA-60KG', 'Cocoa', 'Grade I fermented and dried cocoa beans.', 'https://picsum.photos/seed/cocoa/400', 900.00, 'bags', 2, 80, 20, 5, 7, true, now() - interval '82 days'),
  ('c0000000-0000-4000-8000-000000000005', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Poultry Layer Feed (50kg)', 'FEED-LAY-50KG', 'Feed', 'Balanced layer mash for egg-laying poultry.', 'https://picsum.photos/seed/feed/400', 260.00, 'bags', 8, 15, 50, 3, 4, true, now() - interval '81 days'),
  ('c0000000-0000-4000-8000-000000000006', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Groundnut Paste (20kg pail)', 'GNUT-20KG', 'Confectionery', 'Roasted groundnut paste, smooth-milled.', 'https://picsum.photos/seed/groundnut/400', 300.00, 'pails', 6, 120, 40, 4, 6, true, now() - interval '80 days');

-- Price tiers (3 per product, ascending, non-overlapping)
INSERT INTO price_tiers (id, product_id, min_qty, max_qty, unit_price) VALUES
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000001', 10, 49, 175.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000001', 50, 199, 165.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000001', 200, NULL, 150.00),

  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000002', 5, 19, 210.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000002', 20, 99, 195.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000002', 100, NULL, 180.00),

  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000003', 4, 9, 430.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000003', 10, 49, 410.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000003', 50, NULL, 390.00),

  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000004', 2, 4, 880.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000004', 5, 19, 850.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000004', 20, NULL, 820.00),

  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000005', 8, 19, 250.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000005', 20, 49, 235.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000005', 50, NULL, 215.00),

  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000006', 6, 15, 290.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000006', 16, 59, 275.00),
  (gen_random_uuid(), 'c0000000-0000-4000-8000-000000000006', 60, NULL, 255.00);

-- Orders: one PENDING, one IN_TRANSIT, one DELIVERED
INSERT INTO orders (id, order_number, distributor_id, manufacturer_id, status, delivery_address, subtotal, delivery_fee, total, eta, created_at, updated_at)
VALUES
  ('d0000000-0000-4000-8000-000000000001', 'ZYN-1000', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'PENDING', 'Adum Market Street, Kumasi', 5600.00, 1200.00, 6800.00, NULL, now() - interval '1 day', now() - interval '1 day'),
  ('d0000000-0000-4000-8000-000000000002', 'ZYN-1001', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'IN_TRANSIT', 'Bantama High Street, Kumasi', 8350.00, 1200.00, 9550.00, now() + interval '3 days', now() - interval '6 days', now() - interval '2 days'),
  ('d0000000-0000-4000-8000-000000000003', 'ZYN-1002', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'DELIVERED', 'Asafo Industrial Area, Kumasi', 9100.00, 1200.00, 10300.00, now() - interval '3 days', now() - interval '14 days', now() - interval '3 days');

-- Ensure the sequence continues past the manually seeded order numbers
SELECT setval('order_number_seq', 1002, true);

-- Order items (tier-resolved unit prices, snapshotted)
INSERT INTO order_items (id, order_id, product_id, product_name, unit_price, quantity, line_total) VALUES
  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'Premium Jasmine Rice (25kg bag)', 175.00, 20, 3500.00),
  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 'Cassava Flour (50kg sack)', 210.00, 10, 2100.00),

  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000003', 'Palm Oil (25L jerrycan)', 410.00, 10, 4100.00),
  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000004', 'Cocoa Beans (60kg bag)', 850.00, 5, 4250.00),

  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000005', 'Poultry Layer Feed (50kg)', 235.00, 20, 4700.00),
  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000006', 'Groundnut Paste (20kg pail)', 275.00, 16, 4400.00);

-- Order status history
INSERT INTO order_status_history (id, order_id, status, note, created_at) VALUES
  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000001', 'PENDING', 'Order placed', now() - interval '1 day'),

  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000002', 'PENDING', 'Order placed', now() - interval '6 days'),
  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000002', 'ACCEPTED', 'Accepted by manufacturer', now() - interval '5 days'),
  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000002', 'IN_TRANSIT', 'Packed & dispatched', now() - interval '2 days'),

  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000003', 'PENDING', 'Order placed', now() - interval '14 days'),
  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000003', 'ACCEPTED', 'Accepted by manufacturer', now() - interval '13 days'),
  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000003', 'IN_TRANSIT', 'Packed & dispatched', now() - interval '10 days'),
  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000003', 'OUT_FOR_DELIVERY', 'Out for delivery', now() - interval '4 days'),
  (gen_random_uuid(), 'd0000000-0000-4000-8000-000000000003', 'DELIVERED', 'Delivered', now() - interval '3 days');

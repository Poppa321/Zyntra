-- Real product photography (Unsplash, free-to-use CDN links) in place of the
-- picsum.photos placeholder images, so seeded products don't look templatey.
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1686820740687-426a7b9b2043?w=800&q=80&auto=format&fit=crop'
WHERE id = 'c0000000-0000-4000-8000-000000000001'; -- Premium Jasmine Rice (25kg bag)

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1757283961570-682154747d9c?w=800&q=80&auto=format&fit=crop'
WHERE id = 'c0000000-0000-4000-8000-000000000002'; -- Cassava Flour (50kg sack)

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80&auto=format&fit=crop'
WHERE id = 'c0000000-0000-4000-8000-000000000003'; -- Palm Oil (25L jerrycan)

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1493925410384-84f842e616fb?w=800&q=80&auto=format&fit=crop'
WHERE id = 'c0000000-0000-4000-8000-000000000004'; -- Cocoa Beans (60kg bag)

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1569466593977-94ee7ed02ec9?w=800&q=80&auto=format&fit=crop'
WHERE id = 'c0000000-0000-4000-8000-000000000005'; -- Poultry Layer Feed (50kg)

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1549978113-29eb25c8177f?w=800&q=80&auto=format&fit=crop'
WHERE id = 'c0000000-0000-4000-8000-000000000006'; -- Groundnut Paste (20kg pail)

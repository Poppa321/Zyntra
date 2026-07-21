-- Platform service charge: a commission on each order, deducted from the
-- manufacturer's payout rather than added to what the distributor pays.
-- Backfilled to 0 for existing orders (fee didn't exist when they were placed).
ALTER TABLE orders ADD COLUMN platform_fee_amount NUMERIC(12,2) NOT NULL DEFAULT 0;

-- Product images are now uploaded and stored as base64 data URIs rather than
-- externally hosted URLs, which no longer fit in a short VARCHAR.
ALTER TABLE products ALTER COLUMN image_url TYPE TEXT;

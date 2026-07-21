-- Google OAuth: accounts created via Google never set a local password, and
-- Google's account id is the lookup key for returning sign-ins.
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;

-- Featured product listings (monetization): a manufacturer pays to boost a
-- product to the top of "Featured" placements for a fixed window.
ALTER TABLE products ADD COLUMN featured_until TIMESTAMPTZ;

CREATE TABLE product_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  manufacturer_id UUID NOT NULL REFERENCES users(id),
  reference VARCHAR(64) NOT NULL UNIQUE,
  amount_kobo BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'INITIALIZED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_product_boosts_product ON product_boosts(product_id);

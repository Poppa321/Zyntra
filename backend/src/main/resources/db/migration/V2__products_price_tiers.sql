CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(160) NOT NULL,
  sku VARCHAR(60) NOT NULL,
  category VARCHAR(40) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  base_unit_price NUMERIC(12,2) NOT NULL CHECK (base_unit_price >= 0),
  unit VARCHAR(30) NOT NULL DEFAULT 'pieces',
  moq INT NOT NULL DEFAULT 1 CHECK (moq >= 1),
  stock_qty INT NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  low_stock_threshold INT NOT NULL DEFAULT 50,
  lead_time_days_min INT NOT NULL DEFAULT 3,
  lead_time_days_max INT NOT NULL DEFAULT 5,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (manufacturer_id, sku)
);
CREATE INDEX idx_products_category ON products(category) WHERE active;
CREATE INDEX idx_products_name ON products USING gin (to_tsvector('simple', name));

CREATE TABLE price_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  min_qty INT NOT NULL CHECK (min_qty >= 1),
  max_qty INT,                       -- NULL = unbounded
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0)
);

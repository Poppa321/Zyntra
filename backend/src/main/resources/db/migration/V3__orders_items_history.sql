CREATE SEQUENCE order_number_seq START 1000;
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(20) NOT NULL UNIQUE,
  distributor_id UUID NOT NULL REFERENCES users(id),
  manufacturer_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(24) NOT NULL,
  delivery_address VARCHAR(300),
  subtotal NUMERIC(12,2) NOT NULL,
  delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  eta TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name VARCHAR(160) NOT NULL,   -- snapshot
  unit_price NUMERIC(12,2) NOT NULL,    -- snapshot (tier-resolved)
  quantity INT NOT NULL CHECK (quantity >= 1),
  line_total NUMERIC(12,2) NOT NULL
);
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(24) NOT NULL,
  note VARCHAR(300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Group buying / bulk pooling: lets distributors who can't individually meet
-- a product's MOQ combine orders until the pool's target quantity is met.
CREATE TABLE product_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  target_qty INT NOT NULL,
  pooled_qty INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_pools_product_status ON product_pools (product_id, status);

CREATE TABLE pool_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES product_pools(id),
  distributor_id UUID NOT NULL REFERENCES users(id),
  quantity INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pool_id, distributor_id)
);

CREATE INDEX idx_pool_contributions_pool ON pool_contributions (pool_id);

-- Product reviews: one review per (product, distributor) pair, tied to the
-- delivered order that proves the reviewer actually bought the product.
CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  distributor_id UUID NOT NULL REFERENCES users(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, distributor_id)
);
CREATE INDEX idx_product_reviews_product ON product_reviews(product_id);

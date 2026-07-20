CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id),
  reference VARCHAR(64) NOT NULL UNIQUE,       -- Paystack reference
  amount_kobo BIGINT NOT NULL,                 -- Paystack uses minor units (pesewas for GHS)
  currency VARCHAR(8) NOT NULL DEFAULT 'GHS',
  status VARCHAR(20) NOT NULL DEFAULT 'INITIALIZED',  -- INITIALIZED | SUCCESS | FAILED
  authorization_url VARCHAR(500),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

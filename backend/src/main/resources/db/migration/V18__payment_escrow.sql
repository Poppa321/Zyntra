-- Escrow protection: a successful payment is held by the platform, not
-- auto-forwarded to the manufacturer — the distributor explicitly releases
-- it after confirming the order was actually delivered.
ALTER TABLE payments ADD COLUMN escrow_released BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE payments ADD COLUMN escrow_released_at TIMESTAMPTZ;

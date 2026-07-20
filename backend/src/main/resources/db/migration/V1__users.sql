CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  business_name VARCHAR(160),
  role VARCHAR(20),                -- MANUFACTURER | DISTRIBUTOR | null until selected
  phone VARCHAR(30),
  city VARCHAR(80),
  verified BOOLEAN NOT NULL DEFAULT false,
  dark_mode BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

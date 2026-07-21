-- Short-lived, single-use codes for the "forgot password" flow. code_hash is
-- BCrypt (same PasswordEncoder as user passwords), not the plaintext code —
-- a leaked DB row shouldn't hand out reset access.
CREATE TABLE password_reset_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash VARCHAR(100) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_password_reset_codes_user_id ON password_reset_codes(user_id);

-- Expo push token per user (single active device — re-registering overwrites
-- the previous token, which is fine for the common case of one phone per
-- account and avoids a separate multi-device table for now).
ALTER TABLE users ADD COLUMN push_token VARCHAR(255);

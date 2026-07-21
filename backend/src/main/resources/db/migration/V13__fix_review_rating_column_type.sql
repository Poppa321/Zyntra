-- V11 declared rating as SMALLINT, but the entity maps a plain Java `int` to
-- SQL INTEGER (matching every other int field in this schema) — Hibernate's
-- schema validator flags the mismatch on startup. Widen it to match.
ALTER TABLE product_reviews ALTER COLUMN rating TYPE INTEGER;

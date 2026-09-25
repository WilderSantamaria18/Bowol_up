-- ============================================================
-- V19: ADD DELETED_AT TO BRAND_PROFILES AND SOCIAL_POSTS
-- ============================================================

ALTER TABLE brand_profiles
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE social_posts
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

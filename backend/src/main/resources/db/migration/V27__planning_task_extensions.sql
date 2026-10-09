-- ============================================================
-- V27: Extend tasks table with BOWOL Plans 2.0 operational metadata
-- (Blocked protocol fields & Acceptance criteria / Done gatekeeper)
-- ============================================================

ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS blocked_reason TEXT,
    ADD COLUMN IF NOT EXISTS blocked_resolver VARCHAR(150),
    ADD COLUMN IF NOT EXISTS blocked_review_date DATE,
    ADD COLUMN IF NOT EXISTS acceptance_evidence TEXT,
    ADD COLUMN IF NOT EXISTS acceptance_reviewed_by VARCHAR(150);

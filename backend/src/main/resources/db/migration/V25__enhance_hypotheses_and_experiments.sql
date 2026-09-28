-- ============================================================
-- V25: Enhance Hypotheses and Experiments for Scientific Validation
-- ============================================================

-- Hypotheses enhancements
ALTER TABLE hypotheses
    ADD COLUMN IF NOT EXISTS target_segment TEXT,
    ADD COLUMN IF NOT EXISTS problem_statement TEXT,
    ADD COLUMN IF NOT EXISTS solution_proposal TEXT,
    ADD COLUMN IF NOT EXISTS expected_outcome TEXT;

-- Experiments enhancements
ALTER TABLE experiments
    ADD COLUMN IF NOT EXISTS owner_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS budget NUMERIC(12,2),
    ADD COLUMN IF NOT EXISTS target_metric TEXT,
    ADD COLUMN IF NOT EXISTS evidence_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_experiments_owner
    ON experiments (organization_id, owner_name);

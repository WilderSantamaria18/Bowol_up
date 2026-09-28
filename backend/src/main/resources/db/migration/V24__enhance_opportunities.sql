-- V24__enhance_opportunities.sql
-- Ampliación de campos estratégicos en oportunidades para trazabilidad RICE completa

ALTER TABLE opportunities
    ADD COLUMN IF NOT EXISTS problem TEXT,
    ADD COLUMN IF NOT EXISTS proposal TEXT,
    ADD COLUMN IF NOT EXISTS target_segment VARCHAR(150),
    ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20) DEFAULT 'MEDIUM',
    ADD COLUMN IF NOT EXISTS owner_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS related_trend_id UUID REFERENCES trends(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_opportunities_related_trend
    ON opportunities (related_trend_id)
    WHERE related_trend_id IS NOT NULL;

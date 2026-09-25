-- ============================================================
-- EVIDENCE_REFS (trazabilidad genérica a trends)
-- ============================================================
CREATE TABLE evidence_refs (
    id              BIGSERIAL PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type     VARCHAR(30) NOT NULL,
    entity_id       UUID NOT NULL,
    trend_id        UUID REFERENCES trends(id) ON DELETE CASCADE,
    note            TEXT,
    weight          SMALLINT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_evidence_refs_entity
        CHECK (entity_type IN ('SWOT','OPPORTUNITY','HYPOTHESIS')),
    CONSTRAINT chk_evidence_refs_weight CHECK (weight IS NULL OR weight BETWEEN 0 AND 100)
);

CREATE INDEX idx_evidence_refs_entity ON evidence_refs (entity_type, entity_id);
CREATE INDEX idx_evidence_refs_trend  ON evidence_refs (trend_id) WHERE trend_id IS NOT NULL;
CREATE INDEX idx_evidence_refs_org    ON evidence_refs (organization_id, entity_type);

COMMENT ON TABLE evidence_refs IS
    'Trazabilidad N:M entre entidades de análisis y trends fuente. Complementa JSONB evidence.';

-- ============================================================
-- OPPORTUNITIES (con reach_score para RICE real)
-- ============================================================
CREATE TABLE opportunities (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    swot_analysis_id    UUID REFERENCES swot_analyses(id) ON DELETE SET NULL,
    title               TEXT NOT NULL,
    description         TEXT,
    reach_score         SMALLINT,
    impact_score        SMALLINT,
    effort_score        SMALLINT,
    confidence_score    SMALLINT,
    priority_score      NUMERIC(8,2),
    status              VARCHAR(20) NOT NULL DEFAULT 'IDENTIFIED',
    evidence            JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ,
    CONSTRAINT chk_opportunities_status
        CHECK (status IN ('IDENTIFIED','EVALUATING','APPROVED','REJECTED','CONVERTED')),
    CONSTRAINT chk_opportunities_scores CHECK (
        (reach_score      IS NULL OR reach_score      BETWEEN 0 AND 100) AND
        (impact_score     IS NULL OR impact_score     BETWEEN 0 AND 100) AND
        (effort_score     IS NULL OR effort_score     BETWEEN 0 AND 100) AND
        (confidence_score IS NULL OR confidence_score BETWEEN 0 AND 100)
    )
);

CREATE INDEX idx_opportunities_org_status
    ON opportunities (organization_id, status, priority_score DESC NULLS LAST);
CREATE INDEX idx_opportunities_swot
    ON opportunities (swot_analysis_id)
    WHERE swot_analysis_id IS NOT NULL;

COMMENT ON COLUMN opportunities.priority_score IS
    'RICE = (reach × impact × confidence) / effort. Calculado por servicio, no en BD.';

-- ============================================================
-- HYPOTHESES
-- ============================================================
CREATE TABLE hypotheses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    opportunity_id      UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    statement           TEXT NOT NULL,
    validation_method   TEXT,
    success_metric      TEXT,
    target_value        TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    result              VARCHAR(20),
    result_notes        TEXT,
    validated_at        TIMESTAMPTZ,
    created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ,
    CONSTRAINT chk_hypotheses_status
        CHECK (status IN ('DRAFT','READY','RUNNING','VALIDATED','INVALIDATED','CANCELED')),
    CONSTRAINT chk_hypotheses_result
        CHECK (result IS NULL OR result IN ('SUPPORTED','REFUTED','INCONCLUSIVE'))
);

CREATE INDEX idx_hypotheses_org_opp
    ON hypotheses (organization_id, opportunity_id, status);
CREATE INDEX idx_hypotheses_org_status
    ON hypotheses (organization_id, status, updated_at DESC);

COMMENT ON TABLE hypotheses IS
    'Hipótesis de negocio derivadas de oportunidades. Paso previo a experimentos.';

-- ============================================================
-- EXPERIMENTS
-- ============================================================
CREATE TABLE experiments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    hypothesis_id       UUID NOT NULL REFERENCES hypotheses(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,
    description         TEXT,
    method              TEXT,
    start_date          DATE,
    end_date            DATE,
    status              VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    result_metric       TEXT,
    result_value        TEXT,
    conclusion          TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ,
    CONSTRAINT chk_experiments_status
        CHECK (status IN ('PLANNED','RUNNING','COMPLETED','ABORTED')),
    CONSTRAINT chk_experiments_dates
        CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_experiments_hypothesis
    ON experiments (hypothesis_id, status);
CREATE INDEX idx_experiments_org_status
    ON experiments (organization_id, status, start_date DESC NULLS LAST);

COMMENT ON TABLE experiments IS
    'Experimentos que validan hipótesis. Cierra el ciclo Estrategia → Ejecución.';

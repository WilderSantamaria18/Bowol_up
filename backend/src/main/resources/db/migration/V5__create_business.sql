-- ============================================================
-- BUSINESS_PROFILES
-- ============================================================
CREATE TABLE business_profiles (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id         UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
    industry                TEXT,
    size                    VARCHAR(20),
    market                  TEXT,
    goals                   JSONB NOT NULL DEFAULT '[]'::jsonb,
    problems                JSONB NOT NULL DEFAULT '[]'::jsonb,
    tools                   JSONB NOT NULL DEFAULT '[]'::jsonb,
    competitors             JSONB NOT NULL DEFAULT '[]'::jsonb,
    channels                JSONB NOT NULL DEFAULT '[]'::jsonb,
    digital_maturity        SMALLINT,
    ai_maturity             SMALLINT,
    onboarding_completed_at TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ,
    deleted_at              TIMESTAMPTZ,
    CONSTRAINT chk_business_profiles_maturity CHECK (
        (digital_maturity IS NULL OR digital_maturity BETWEEN 0 AND 100) AND
        (ai_maturity      IS NULL OR ai_maturity      BETWEEN 0 AND 100)
    )
);

-- ============================================================
-- SWOT_ANALYSES (con snapshot del perfil + evidence_refs)
-- ============================================================
CREATE TABLE swot_analyses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    business_profile_id UUID REFERENCES business_profiles(id) ON DELETE SET NULL,
    profile_snapshot    JSONB NOT NULL DEFAULT '{}'::jsonb,
    strengths           JSONB NOT NULL DEFAULT '[]'::jsonb,
    weaknesses          JSONB NOT NULL DEFAULT '[]'::jsonb,
    opportunities       JSONB NOT NULL DEFAULT '[]'::jsonb,
    threats             JSONB NOT NULL DEFAULT '[]'::jsonb,
    summary             JSONB,
    ai_provider         VARCHAR(30),
    ai_model_used       VARCHAR(60),
    generated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_swot_analyses_org
    ON swot_analyses (organization_id, generated_at DESC);

COMMENT ON COLUMN swot_analyses.profile_snapshot IS
    'Copia inmutable del business_profile + contexto usado por la IA al generar este FODA.';

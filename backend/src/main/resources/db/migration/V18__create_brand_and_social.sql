-- ============================================================
-- V18: BRAND PROFILE & SOCIAL INTELLIGENCE
-- ============================================================

-- 1. Brand Profile (Kit de Marca)
CREATE TABLE IF NOT EXISTS brand_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
    brand_name          VARCHAR(150) NOT NULL,
    tagline             VARCHAR(255),
    brand_voice_tone    VARCHAR(50) NOT NULL DEFAULT 'PROFESSIONAL',
    target_audience     TEXT,
    primary_color       VARCHAR(20) DEFAULT '#EA580C',
    secondary_color     VARCHAR(20) DEFAULT '#10B981',
    accent_color        VARCHAR(20) DEFAULT '#6366F1',
    font_heading        VARCHAR(100) DEFAULT 'Plus Jakarta Sans',
    font_body           VARCHAR(100) DEFAULT 'Inter',
    key_values          JSONB DEFAULT '[]'::jsonb,
    do_guidelines       TEXT,
    dont_guidelines     TEXT,
    logo_url            VARCHAR(500),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_brand_profiles_org
    ON brand_profiles (organization_id);

-- 2. Social Posts & Content Proposals
CREATE TABLE IF NOT EXISTS social_posts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id          UUID REFERENCES projects(id) ON DELETE SET NULL,
    opportunity_id      UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    channel             VARCHAR(50) NOT NULL DEFAULT 'LINKEDIN',
    title               VARCHAR(200) NOT NULL,
    content             TEXT NOT NULL,
    status              VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    scheduled_at        TIMESTAMPTZ,
    published_at        TIMESTAMPTZ,
    predicted_impact    JSONB,
    media_urls          JSONB DEFAULT '[]'::jsonb,
    tags                JSONB DEFAULT '[]'::jsonb,
    created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_social_posts_org_status
    ON social_posts (organization_id, status);

CREATE INDEX IF NOT EXISTS idx_social_posts_org_channel
    ON social_posts (organization_id, channel);

CREATE INDEX IF NOT EXISTS idx_social_posts_org_created
    ON social_posts (organization_id, created_at DESC);

-- Habilitar y forzar Row Level Security
DO $$
BEGIN
    -- RLS for brand_profiles
    ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE brand_profiles FORCE ROW LEVEL SECURITY;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'brand_profiles' AND policyname = 'p_brand_profiles_tenant'
    ) THEN
        CREATE POLICY p_brand_profiles_tenant ON brand_profiles
            USING (organization_id = current_organization_id())
            WITH CHECK (organization_id = current_organization_id());
    END IF;

    -- RLS for social_posts
    ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE social_posts FORCE ROW LEVEL SECURITY;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'social_posts' AND policyname = 'p_social_posts_tenant'
    ) THEN
        CREATE POLICY p_social_posts_tenant ON social_posts
            USING (organization_id = current_organization_id())
            WITH CHECK (organization_id = current_organization_id());
    END IF;
END $$;

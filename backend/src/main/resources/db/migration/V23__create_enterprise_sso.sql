-- ============================================================
-- V23: ENTERPRISE SINGLE SIGN-ON (SSO / OIDC / SAML2)
-- ============================================================

CREATE TABLE IF NOT EXISTS organization_sso_configs (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    provider                VARCHAR(30) NOT NULL, -- 'GOOGLE', 'AZURE_AD', 'OIDC', 'SAML2'
    display_name            VARCHAR(100) NOT NULL DEFAULT 'Corporate SSO',
    client_id               VARCHAR(255) NOT NULL,
    client_secret           VARCHAR(255),
    issuer_uri              TEXT,
    metadata_url            TEXT,
    authorization_url       TEXT,
    token_url               TEXT,
    userinfo_url            TEXT,
    domain_restriction      VARCHAR(255), -- ej: 'empresa.com'
    is_enabled              BOOLEAN NOT NULL DEFAULT TRUE,
    enforce_sso             BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ,
    deleted_at              TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_org_sso_provider ON organization_sso_configs (organization_id, provider) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_sso_domain ON organization_sso_configs (domain_restriction) WHERE is_enabled = TRUE AND deleted_at IS NULL;

-- Habilitar RLS en la tabla de configuración SSO
ALTER TABLE organization_sso_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_sso_configs FORCE  ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'organization_sso_configs' AND policyname = 'p_organization_sso_configs_tenant'
    ) THEN
        CREATE POLICY p_organization_sso_configs_tenant ON organization_sso_configs
            USING (organization_id = current_organization_id())
            WITH CHECK (organization_id = current_organization_id());
    END IF;
END $$;

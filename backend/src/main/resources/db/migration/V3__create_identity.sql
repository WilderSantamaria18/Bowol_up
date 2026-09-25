-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT NOT NULL,
    password_hash   VARCHAR(60) NOT NULL,
    name            TEXT NOT NULL,
    avatar_url      TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT chk_users_status CHECK (status IN ('ACTIVE','INACTIVE','SUSPENDED','PENDING'))
);

CREATE UNIQUE INDEX uq_users_email
    ON users (LOWER(email))
    WHERE deleted_at IS NULL;

COMMENT ON TABLE users IS 'Usuarios de la plataforma (global, sin tenant propio).';

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
CREATE TABLE organizations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    slug            TEXT NOT NULL,
    logo_url        TEXT,
    industry        TEXT,
    country         CHAR(2),
    size            VARCHAR(20),
    website         TEXT,
    settings        JSONB NOT NULL DEFAULT '{}'::jsonb,
    member_count    INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT uq_organizations_slug UNIQUE (slug),
    CONSTRAINT chk_organizations_size
        CHECK (size IS NULL OR size IN ('SOLO','MICRO','SMALL','MEDIUM','LARGE','ENTERPRISE')),
    CONSTRAINT chk_organizations_member_count CHECK (member_count >= 0)
);

CREATE INDEX idx_organizations_name_trgm
    ON organizations USING GIN (name gin_trgm_ops)
    WHERE deleted_at IS NULL;

COMMENT ON TABLE organizations IS 'Tenant principal. Toda tabla de negocio referencia esta.';

-- ============================================================
-- ORGANIZATION_MEMBERS
-- ============================================================
CREATE TABLE organization_members (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role            VARCHAR(30) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_organization_members UNIQUE (user_id, organization_id),
    CONSTRAINT chk_organization_members_role
        CHECK (role IN ('OWNER','ADMIN','MANAGER','MEMBER')),
    CONSTRAINT chk_organization_members_status
        CHECK (status IN ('ACTIVE','INVITED','SUSPENDED'))
);

CREATE INDEX idx_organization_members_organization
    ON organization_members (organization_id, role);

-- ============================================================
-- REFRESH_TOKENS
-- ============================================================
CREATE TABLE refresh_tokens (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(64) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked_at      TIMESTAMPTZ,
    user_agent      TEXT,
    ip_address      INET,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_refresh_tokens_hash UNIQUE (token_hash)
);

CREATE INDEX idx_refresh_tokens_user
    ON refresh_tokens (user_id)
    WHERE revoked_at IS NULL;

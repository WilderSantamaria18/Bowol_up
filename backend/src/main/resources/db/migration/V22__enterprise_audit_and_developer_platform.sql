-- ============================================================
-- V22: ENTERPRISE AUDIT LOGS, DEVELOPER PLATFORM & WEBHOOKS
-- ============================================================

-- 1. Ajustes y ampliación de tabla audit_logs
ALTER TABLE audit_logs ALTER COLUMN ip_address TYPE VARCHAR(100);

ALTER TABLE audit_logs 
    ADD COLUMN IF NOT EXISTS actor_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS details_json JSONB DEFAULT '{}'::jsonb;

-- Índices adicionales para búsquedas y filtros en auditoría
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_email ON audit_logs (actor_email) WHERE actor_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);

-- 2. Tabla de Claves de API (Developer Platform)
CREATE TABLE IF NOT EXISTS api_keys (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name                    VARCHAR(100) NOT NULL,
    key_prefix              VARCHAR(30) NOT NULL,
    key_hash                VARCHAR(64) NOT NULL,
    created_by              UUID REFERENCES users(id) ON DELETE SET NULL,
    last_used_at            TIMESTAMPTZ,
    expires_at              TIMESTAMPTZ,
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    revoked_at              TIMESTAMPTZ,
    revoked_by              UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ,
    deleted_at              TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys (key_hash) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_api_keys_org_active ON api_keys (organization_id, is_active) WHERE deleted_at IS NULL;

-- 3. Tabla de Webhook Endpoints
CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    url                     TEXT NOT NULL,
    description             VARCHAR(255),
    secret                  VARCHAR(100) NOT NULL,
    events                  JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    created_by              UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ,
    deleted_at              TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_org ON webhook_endpoints (organization_id, is_active) WHERE deleted_at IS NULL;

-- 4. Tabla de Registros de Entregas de Webhooks (Delivery Logs)
CREATE TABLE IF NOT EXISTS webhook_delivery_logs (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    webhook_endpoint_id     UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
    event_type              VARCHAR(100) NOT NULL,
    payload                 JSONB NOT NULL,
    status_code             INTEGER,
    response_body           TEXT,
    success                 BOOLEAN NOT NULL,
    attempts                INTEGER NOT NULL DEFAULT 1,
    error_message           TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_delivery_endpoint ON webhook_delivery_logs (webhook_endpoint_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_delivery_org ON webhook_delivery_logs (organization_id, created_at DESC);

-- 5. Habilitar RLS en las nuevas tablas
DO $$
DECLARE
    t TEXT;
    enterprise_tables TEXT[] := ARRAY[
        'api_keys',
        'webhook_endpoints',
        'webhook_delivery_logs'
    ];
BEGIN
    FOREACH t IN ARRAY enterprise_tables LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('ALTER TABLE %I FORCE  ROW LEVEL SECURITY', t);

        EXECUTE format($f$
            CREATE POLICY p_%s_tenant ON %I
            USING (organization_id = current_organization_id())
            WITH CHECK (organization_id = current_organization_id())
        $f$, t, t);
    END LOOP;
END $$;

-- 6. Ampliar estados de tareas para admitir BLOCKED
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS chk_tasks_status;
ALTER TABLE tasks ADD CONSTRAINT chk_tasks_status CHECK (status IN ('BACKLOG','TODO','IN_PROGRESS','REVIEW','DONE','CANCELED','BLOCKED'));

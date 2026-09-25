-- ============================================================
-- V20: SUBSCRIPTION PLANS, TENANT SUBSCRIPTIONS & BILLING
-- ============================================================

-- 1. Subscription Plans Catalog
CREATE TABLE IF NOT EXISTS subscription_plans (
    id                  VARCHAR(50) PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    description         TEXT,
    price_usd_monthly   NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    ai_credits_monthly  INTEGER NOT NULL DEFAULT 500,
    max_projects        INTEGER NOT NULL DEFAULT 3,
    max_members         INTEGER NOT NULL DEFAULT 5,
    features            JSONB DEFAULT '[]'::jsonb,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Default Plans
INSERT INTO subscription_plans (id, name, description, price_usd_monthly, ai_credits_monthly, max_projects, max_members, features, is_active)
VALUES
(
    'FREE',
    'Free Explorer',
    'Ideal para startups en fase inicial y validación de primeras hipótesis estratégicas.',
    0.00,
    500,
    3,
    5,
    '["500 AI Credits mensuales", "Hasta 3 proyectos activos", "Matriz FODA dinámica", "Tablero Kanban de ejecución", "Calendario de hitos"]'::jsonb,
    TRUE
),
(
    'PRO',
    'Pro Growth',
    'Para empresas y scale-ups que necesitan acelerar su innovación y presencia de marca con IA.',
    49.00,
    5000,
    25,
    20,
    '["5,000 AI Credits mensuales", "Hasta 25 proyectos activos", "AI Content Studio multicanal", "Estimación de impacto predictivo", "Sprint Planning asistido por IA", "Integración iCalendar bidireccional", "Soporte prioritario"]'::jsonb,
    TRUE
),
(
    'BUSINESS',
    'Business Enterprise',
    'Capacidad ilimitada para corporaciones y equipos multidisciplinarios de alto rendimiento.',
    199.00,
    25000,
    -1,
    -1,
    '["25,000 AI Credits mensuales", "Proyectos y miembros ilimitados", "Modelos de IA dedicados de baja latencia", "Kit de marca avanzado y arquetipos", "Auditoría de tokens y gobernanza", "Gestor de cuenta dedicado"]'::jsonb,
    TRUE
)
ON CONFLICT (id) DO NOTHING;

-- 2. Organization Subscriptions
CREATE TABLE IF NOT EXISTS organization_subscriptions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id         UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id                 VARCHAR(50) NOT NULL REFERENCES subscription_plans(id),
    status                  VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    current_period_start    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end      TIMESTAMPTZ NOT NULL,
    ai_credits_total        INTEGER NOT NULL DEFAULT 500,
    ai_credits_used         INTEGER NOT NULL DEFAULT 0,
    payment_gateway         VARCHAR(50) DEFAULT 'MOCK_STRIPE',
    gateway_subscription_id VARCHAR(100),
    gateway_customer_id     VARCHAR(100),
    cancel_at_period_end    BOOLEAN DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ,
    deleted_at              TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_org_subscriptions_org
    ON organization_subscriptions (organization_id);

CREATE INDEX IF NOT EXISTS idx_org_subscriptions_status
    ON organization_subscriptions (status);

-- 3. Billing Invoices
CREATE TABLE IF NOT EXISTS billing_invoices (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invoice_number      VARCHAR(100) NOT NULL,
    amount_usd          NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status              VARCHAR(50) NOT NULL DEFAULT 'PAID',
    plan_name           VARCHAR(100) NOT NULL,
    period_start        TIMESTAMPTZ NOT NULL,
    period_end          TIMESTAMPTZ NOT NULL,
    pdf_url             VARCHAR(500),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ,
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_billing_invoices_org
    ON billing_invoices (organization_id, created_at DESC);

-- Habilitar y forzar Row Level Security
DO $$
BEGIN
    -- RLS for organization_subscriptions
    ALTER TABLE organization_subscriptions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE organization_subscriptions FORCE ROW LEVEL SECURITY;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'organization_subscriptions' AND policyname = 'p_org_subscriptions_tenant'
    ) THEN
        CREATE POLICY p_org_subscriptions_tenant ON organization_subscriptions
            USING (organization_id = current_organization_id())
            WITH CHECK (organization_id = current_organization_id());
    END IF;

    -- RLS for billing_invoices
    ALTER TABLE billing_invoices ENABLE ROW LEVEL SECURITY;
    ALTER TABLE billing_invoices FORCE ROW LEVEL SECURITY;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'billing_invoices' AND policyname = 'p_billing_invoices_tenant'
    ) THEN
        CREATE POLICY p_billing_invoices_tenant ON billing_invoices
            USING (organization_id = current_organization_id())
            WITH CHECK (organization_id = current_organization_id());
    END IF;
END $$;

-- ============================================================
-- PLANS
-- ============================================================
CREATE TABLE plans (
    id                  BIGSERIAL PRIMARY KEY,
    code                VARCHAR(30) NOT NULL,
    name                TEXT NOT NULL,
    description         TEXT,
    price_monthly       NUMERIC(10,2) NOT NULL DEFAULT 0,
    price_yearly        NUMERIC(10,2) NOT NULL DEFAULT 0,
    currency            CHAR(3) NOT NULL DEFAULT 'USD',
    features            JSONB NOT NULL DEFAULT '{}'::jsonb,
    ai_credits_monthly  INT NOT NULL DEFAULT 0,
    max_users           INT,
    max_projects        INT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ,
    CONSTRAINT uq_plans_code UNIQUE (code),
    CONSTRAINT chk_plans_prices CHECK (price_monthly >= 0 AND price_yearly >= 0),
    CONSTRAINT chk_plans_credits CHECK (ai_credits_monthly >= 0)
);

INSERT INTO plans (code, name, price_monthly, price_yearly, ai_credits_monthly, max_users, max_projects, features) VALUES
('FREE',       'Free',        0,    0,     10,    1,    1,
 '{"trends_basic":true,"swot":"basic","ai_research":5}'),
('PRO',        'Pro',        29,  290,    500,    5,   10,
 '{"trends_basic":true,"swot":"advanced","ai_research":100,"sprints":true,"calendar":true}'),
('BUSINESS',   'Business',   99,  990,   3000,   25,  100,
 '{"trends_basic":true,"swot":"advanced","ai_research":1000,"sprints":true,"calendar":true,"social":true,"brand":true,"experiments":true}'),
('ENTERPRISE', 'Enterprise',  0,    0,      0, NULL, NULL,
 '{"custom":true,"sso":true,"api":true,"experiments":true}');

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE subscriptions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id                 BIGINT NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status                  VARCHAR(30) NOT NULL DEFAULT 'TRIALING',
    current_period_start    TIMESTAMPTZ NOT NULL,
    current_period_end      TIMESTAMPTZ NOT NULL,
    trial_ends_at           TIMESTAMPTZ,
    canceled_at             TIMESTAMPTZ,
    stripe_subscription_id  TEXT,
    stripe_customer_id      TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ,
    CONSTRAINT chk_subscriptions_status
        CHECK (status IN ('TRIALING','ACTIVE','PAST_DUE','CANCELED','EXPIRED')),
    CONSTRAINT chk_subscriptions_period CHECK (current_period_end > current_period_start)
);

CREATE UNIQUE INDEX uq_subscriptions_org_active
    ON subscriptions (organization_id)
    WHERE status IN ('TRIALING','ACTIVE','PAST_DUE');

CREATE INDEX idx_subscriptions_plan ON subscriptions (plan_id);

CREATE UNIQUE INDEX uq_subscriptions_stripe
    ON subscriptions (stripe_subscription_id)
    WHERE stripe_subscription_id IS NOT NULL;

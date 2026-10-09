-- ============================================================
-- V28: BOWOL Plans 2.0 Operational Persistence
-- Persistencia colaborativa de entidades estratégicas y operativas:
-- 1. Project Charters (Fase 2 SMART)
-- 2. Capacity Plans y Alocación por Miembro (Fase 1 y 5)
-- 3. Retrospectivas Semanales y Compromisos de Mejora (Fase 6)
-- 4. Check-ins Diarios (Fase 6)
-- 5. Extensión de tareas con dependencias, horas de espera externa y área
-- 6. Extensión de oportunidades con habilitadoras y notas de evidencia
-- ============================================================

-- 1. Ampliación de tareas (tasks) con campos operativos metodológicos
ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS external_wait_hours NUMERIC(5,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS area VARCHAR(100),
    ADD COLUMN IF NOT EXISTS deliverable TEXT,
    ADD COLUMN IF NOT EXISTS depends_on JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 2. Ampliación de oportunidades con bandera habilitadora y notas
ALTER TABLE opportunities
    ADD COLUMN IF NOT EXISTS is_mandatory_enabler BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS evidence_notes TEXT;

-- 3. Tabla project_charters (Ficha SMART de Proyecto)
CREATE TABLE IF NOT EXISTS project_charters (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id             UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id                  UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
    problem_addressed           TEXT,
    smart_objective             TEXT,
    measurable_kpi              TEXT,
    baseline_value              TEXT,
    baseline_unit               TEXT,
    baseline_date               DATE,
    baseline_is_provisional     BOOLEAN DEFAULT FALSE,
    target_value                TEXT,
    target_unit                 TEXT,
    target_deadline             DATE,
    measurement_source          TEXT,
    owner_decision_required     BOOLEAN DEFAULT FALSE,
    owner_decision_details      TEXT,
    technical_deliverables      JSONB NOT NULL DEFAULT '[]'::jsonb,
    expected_commercial_result  TEXT,
    in_scope                    JSONB NOT NULL DEFAULT '[]'::jsonb,
    out_of_scope                JSONB NOT NULL DEFAULT '[]'::jsonb,
    restrictions                JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_project_charters_org ON project_charters(organization_id);

-- 4. Tabla capacity_plans (Capacidad del equipo y buffer del 20%)
CREATE TABLE IF NOT EXISTS capacity_plans (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    period_label        VARCHAR(100) NOT NULL,
    buffer_percentage   NUMERIC(5,2) NOT NULL DEFAULT 20.0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_capacity_plans_org ON capacity_plans(organization_id);

CREATE TABLE IF NOT EXISTS capacity_member_allocations (
    id                  BIGSERIAL PRIMARY KEY,
    capacity_plan_id    UUID NOT NULL REFERENCES capacity_plans(id) ON DELETE CASCADE,
    user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
    member_name         VARCHAR(150) NOT NULL,
    member_role         VARCHAR(100),
    available_hours     NUMERIC(5,2) NOT NULL DEFAULT 0,
    assigned_hours      NUMERIC(5,2) NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_capacity_alloc_plan ON capacity_member_allocations(capacity_plan_id);

-- 5. Tabla weekly_retrospectives (Fase 6.2 Retrospectiva de 15 minutos)
CREATE TABLE IF NOT EXISTS weekly_retrospectives (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id              UUID REFERENCES projects(id) ON DELETE CASCADE,
    sprint_id               UUID REFERENCES sprints(id) ON DELETE SET NULL,
    week_label              VARCHAR(150) NOT NULL,
    committed_tasks         INT NOT NULL DEFAULT 0,
    accepted_tasks          INT NOT NULL DEFAULT 0,
    blocked_tasks           INT NOT NULL DEFAULT 0,
    review_pending_tasks    INT NOT NULL DEFAULT 0,
    estimated_hours         NUMERIC(6,2) DEFAULT 0,
    actual_hours            NUMERIC(6,2) DEFAULT 0,
    business_metric_result  TEXT,
    business_metric_date    DATE,
    what_worked             TEXT,
    delay_causes            TEXT,
    improvements            JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_weekly_retros_org ON weekly_retrospectives(organization_id, project_id);

-- 6. Tabla daily_checkins (Fase 6.1 Check-in diario de 3 preguntas)
CREATE TABLE IF NOT EXISTS daily_checkins (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id              UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id                 UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name               VARCHAR(150) NOT NULL,
    date                    DATE NOT NULL,
    yesterday_deliverable   TEXT NOT NULL,
    today_commitment        TEXT NOT NULL,
    blockers                TEXT,
    has_blocker             BOOLEAN DEFAULT FALSE,
    task_id                 UUID REFERENCES tasks(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_checkins_proj ON daily_checkins(project_id, date DESC);

-- 7. Tabla weekly_focus_banners (Fase 5.1 Foco Semanal del Sprint)
CREATE TABLE IF NOT EXISTS weekly_focus_banners (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id              UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
    weekly_deliverable      TEXT NOT NULL,
    identified_risk         TEXT NOT NULL,
    mitigation_plan         TEXT NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_weekly_focus_org ON weekly_focus_banners(organization_id);

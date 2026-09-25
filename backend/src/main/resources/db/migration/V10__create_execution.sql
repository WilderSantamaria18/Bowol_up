-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE projects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    opportunity_id  UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    experiment_id   UUID REFERENCES experiments(id)   ON DELETE SET NULL,
    name            TEXT NOT NULL,
    description     TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'PLANNING',
    start_date      DATE,
    end_date        DATE,
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT chk_projects_status
        CHECK (status IN ('PLANNING','ACTIVE','PAUSED','COMPLETED','ARCHIVED')),
    CONSTRAINT chk_projects_dates
        CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_projects_org_status
    ON projects (organization_id, status)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_opportunity
    ON projects (opportunity_id)
    WHERE opportunity_id IS NOT NULL;
CREATE INDEX idx_projects_experiment
    ON projects (experiment_id)
    WHERE experiment_id IS NOT NULL;

-- ============================================================
-- PROJECT_MEMBERS
-- ============================================================
CREATE TABLE project_members (
    id          BIGSERIAL PRIMARY KEY,
    project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        VARCHAR(30) NOT NULL DEFAULT 'MEMBER',
    added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_project_members UNIQUE (project_id, user_id),
    CONSTRAINT chk_project_members_role
        CHECK (role IN ('OWNER','MANAGER','MEMBER','VIEWER'))
);

CREATE INDEX idx_project_members_user ON project_members (user_id);

-- ============================================================
-- SPRINTS
-- ============================================================
CREATE TABLE sprints (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    goal        TEXT,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ,
    CONSTRAINT chk_sprints_status
        CHECK (status IN ('PLANNED','ACTIVE','COMPLETED','CANCELED')),
    CONSTRAINT chk_sprints_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_sprints_project_status
    ON sprints (project_id, status, start_date DESC);

-- ============================================================
-- TASKS (position con saltos de 1000 para Kanban)
-- ============================================================
CREATE TABLE tasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sprint_id       UUID REFERENCES sprints(id) ON DELETE SET NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'BACKLOG',
    priority        VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',
    assignee_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    estimate_hours  NUMERIC(5,2),
    position        INT NOT NULL DEFAULT 1000,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    CONSTRAINT chk_tasks_status
        CHECK (status IN ('BACKLOG','TODO','IN_PROGRESS','REVIEW','DONE','CANCELED')),
    CONSTRAINT chk_tasks_priority
        CHECK (priority IN ('LOW','MEDIUM','HIGH','URGENT')),
    CONSTRAINT chk_tasks_estimate
        CHECK (estimate_hours IS NULL OR estimate_hours >= 0),
    CONSTRAINT chk_tasks_position CHECK (position >= 0)
);

CREATE INDEX idx_tasks_project_status ON tasks (project_id, status, position);
CREATE INDEX idx_tasks_sprint         ON tasks (sprint_id, status)   WHERE sprint_id   IS NOT NULL;
CREATE INDEX idx_tasks_assignee       ON tasks (assignee_id, status) WHERE assignee_id IS NOT NULL;

COMMENT ON COLUMN tasks.position IS
    'Orden dentro de columna Kanban. Insertar con incrementos de 1000 para evitar reescrituras masivas.';

-- ============================================================
-- V17: CALENDAR EVENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS calendar_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id      UUID REFERENCES projects(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    event_type      VARCHAR(50) NOT NULL DEFAULT 'KEY_EVENT',
    start_date      DATE NOT NULL,
    end_date        DATE,
    color           VARCHAR(30) DEFAULT 'orange',
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_org_date
    ON calendar_events (organization_id, start_date ASC);

CREATE INDEX IF NOT EXISTS idx_calendar_events_org_type
    ON calendar_events (organization_id, event_type);

-- Habilitar y forzar Row Level Security
DO $$
BEGIN
    ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
    ALTER TABLE calendar_events FORCE ROW LEVEL SECURITY;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'calendar_events' AND policyname = 'p_calendar_events_tenant'
    ) THEN
        CREATE POLICY p_calendar_events_tenant ON calendar_events
            USING (organization_id = current_organization_id())
            WITH CHECK (organization_id = current_organization_id());
    END IF;
END $$;

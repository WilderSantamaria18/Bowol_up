-- ============================================================
-- V21: ADD DELETED_AT TO CALENDAR EVENTS FOR SOFT DELETE
-- ============================================================

ALTER TABLE calendar_events
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_calendar_events_deleted_at
    ON calendar_events (deleted_at);

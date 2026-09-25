-- ============================================================
-- RLS para todas las tablas con organization_id
-- ============================================================
DO $$
DECLARE
    t TEXT;
    tenant_tables TEXT[] := ARRAY[
        'organization_members',
        'subscriptions',
        'business_profiles',
        'swot_analyses',
        'trend_relevance',
        'evidence_refs',
        'ai_conversations',
        'ai_usage_logs',
        'opportunities',
        'hypotheses',
        'experiments',
        'projects',
        'integrations',
        'audit_logs'
    ];
BEGIN
    FOREACH t IN ARRAY tenant_tables LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('ALTER TABLE %I FORCE  ROW LEVEL SECURITY', t);

        -- Política para la aplicación (acceso por tenant actual)
        EXECUTE format($f$
            CREATE POLICY p_%s_tenant ON %I
            USING (organization_id = current_organization_id())
            WITH CHECK (organization_id = current_organization_id())
        $f$, t, t);
    END LOOP;
END $$;

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations FORCE  ROW LEVEL SECURITY;

CREATE POLICY p_organizations_member ON organizations
USING (
    id = current_organization_id()
    OR EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.organization_id = organizations.id
          AND om.user_id = current_setting('app.current_user_id', true)::uuid
    )
);

ALTER TABLE trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE trends FORCE  ROW LEVEL SECURITY;

CREATE POLICY p_trends_read ON trends
    FOR SELECT
    USING (current_organization_id() IS NOT NULL);

CREATE POLICY p_trends_worker ON trends
    FOR ALL
    TO bowol_worker
    USING (true)
    WITH CHECK (true);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans FORCE  ROW LEVEL SECURITY;

CREATE POLICY p_plans_read ON plans
    FOR SELECT
    USING (true);

CREATE POLICY p_plans_worker ON plans
    FOR ALL
    TO bowol_worker
    USING (true)
    WITH CHECK (true);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE  ROW LEVEL SECURITY;

CREATE POLICY p_users_self ON users
    USING (id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY p_users_worker ON users
    FOR ALL
    TO bowol_worker
    USING (true)
    WITH CHECK (true);

ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens FORCE  ROW LEVEL SECURITY;

CREATE POLICY p_refresh_tokens_self ON refresh_tokens
    USING (user_id = current_setting('app.current_user_id', true)::uuid);

ALTER TABLE trend_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_sources FORCE  ROW LEVEL SECURITY;

CREATE POLICY p_trend_sources_read ON trend_sources
    FOR SELECT USING (true);

CREATE POLICY p_trend_sources_worker ON trend_sources
    FOR ALL TO bowol_worker USING (true) WITH CHECK (true);

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages FORCE  ROW LEVEL SECURITY;

CREATE POLICY p_ai_messages_tenant ON ai_messages
USING (
    EXISTS (
        SELECT 1 FROM ai_conversations c
        WHERE c.id = ai_messages.conversation_id
          AND c.organization_id = current_organization_id()
    )
);

ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members FORCE  ROW LEVEL SECURITY;

CREATE POLICY p_project_members_tenant ON project_members
USING (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = project_members.project_id
          AND p.organization_id = current_organization_id()
    )
);

ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints FORCE  ROW LEVEL SECURITY;

CREATE POLICY p_sprints_tenant ON sprints
USING (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = sprints.project_id
          AND p.organization_id = current_organization_id()
    )
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks FORCE  ROW LEVEL SECURITY;

CREATE POLICY p_tasks_tenant ON tasks
USING (
    EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = tasks.project_id
          AND p.organization_id = current_organization_id()
    )
);

GRANT USAGE ON SCHEMA public TO bowol_app, bowol_worker;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO bowol_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO bowol_worker;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO bowol_app, bowol_worker;
GRANT EXECUTE ON FUNCTION current_organization_id() TO bowol_app, bowol_worker;

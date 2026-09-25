-- ============================================================
-- Roles de aplicación
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'bowol_app') THEN
        CREATE ROLE bowol_app NOLOGIN NOBYPASSRLS;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'bowol_worker') THEN
        CREATE ROLE bowol_worker NOLOGIN NOBYPASSRLS;
    END IF;
END $$;

-- Helper para leer el organization_id actual desde la sesión
CREATE OR REPLACE FUNCTION current_organization_id()
RETURNS UUID
LANGUAGE SQL STABLE
AS $$
    SELECT NULLIF(current_setting('app.current_organization_id', true), '')::uuid
$$;

COMMENT ON FUNCTION current_organization_id() IS 'Devuelve el tenant actual o NULL si no está definido.';

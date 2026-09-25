CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

COMMENT ON EXTENSION "pgcrypto" IS 'UUID v4 fallback en BD';
COMMENT ON EXTENSION "pg_trgm"  IS 'Índices trigram para ILIKE rápido';
COMMENT ON EXTENSION "unaccent" IS 'Búsquedas full-text sin tildes';

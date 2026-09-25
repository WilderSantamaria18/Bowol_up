-- Índices que complementan los inline (análisis previo a producción)
CREATE INDEX idx_users_name_trgm
    ON users USING GIN (name gin_trgm_ops)
    WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_users_name_trgm IS 'Búsqueda fuzzy por nombre en users.';

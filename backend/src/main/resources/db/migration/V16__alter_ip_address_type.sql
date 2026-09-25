-- Ajustar ip_address para coincidir con la entidad RefreshToken (VARCHAR)
ALTER TABLE refresh_tokens ALTER COLUMN ip_address TYPE VARCHAR(255);

-- Ajustar tags a JSONB para coincidir con @JdbcTypeCode(SqlTypes.JSON) en Trend y TrendRelevance
DROP TRIGGER IF EXISTS trg_trends_search_vector ON trends;
DROP INDEX IF EXISTS idx_trends_tags;
DROP INDEX IF EXISTS idx_trend_relevance_tags;

ALTER TABLE trends 
    ALTER COLUMN tags DROP DEFAULT,
    ALTER COLUMN tags TYPE JSONB USING to_jsonb(tags),
    ALTER COLUMN tags SET DEFAULT '[]'::jsonb;

ALTER TABLE trend_relevance 
    ALTER COLUMN tags DROP DEFAULT,
    ALTER COLUMN tags TYPE JSONB USING to_jsonb(tags),
    ALTER COLUMN tags SET DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_trends_tags ON trends USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_trend_relevance_tags ON trend_relevance USING GIN (tags);

CREATE OR REPLACE FUNCTION trends_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('simple', unaccent(COALESCE(NEW.title, ''))),       'A') ||
        setweight(to_tsvector('simple', unaccent(COALESCE(NEW.description, ''))), 'B') ||
        setweight(to_tsvector('simple', unaccent(COALESCE(NEW.tags::text, ''))),  'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_trends_search_vector
    BEFORE INSERT OR UPDATE OF title, description, tags ON trends
    FOR EACH ROW EXECUTE FUNCTION trends_search_vector_update();

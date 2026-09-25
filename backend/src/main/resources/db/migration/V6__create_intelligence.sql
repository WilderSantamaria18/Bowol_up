-- ============================================================
-- TREND_SOURCES
-- ============================================================
CREATE TABLE trend_sources (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(30) NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    base_url        TEXT,
    source_level    CHAR(1) NOT NULL DEFAULT 'B',
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_synced_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_trend_sources_level CHECK (source_level IN ('A','B','C'))
);

INSERT INTO trend_sources (code, name, base_url, source_level) VALUES
('GITHUB',     'GitHub',      'https://api.github.com',                'A'),
('YOUTUBE',    'YouTube',     'https://www.googleapis.com/youtube/v3', 'B'),
('HACKERNEWS', 'Hacker News', 'https://news.ycombinator.com',          'B'),
('REDDIT',     'Reddit',      'https://www.reddit.com',                'B'),
('DEVTO',      'Dev.to',      'https://dev.to',                        'B');

-- ============================================================
-- TRENDS (GLOBAL — sin organization_id)
-- ============================================================
CREATE TABLE trends (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id       BIGINT NOT NULL REFERENCES trend_sources(id) ON DELETE RESTRICT,
    external_id     TEXT NOT NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    url             TEXT NOT NULL,
    score           INT NOT NULL DEFAULT 0,
    tags            TEXT[] NOT NULL DEFAULT '{}',
    metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
    search_vector   TSVECTOR,
    fetched_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_trends_score CHECK (score BETWEEN 0 AND 100)
);

CREATE UNIQUE INDEX uq_trends_source_external
    ON trends (source_id, external_id);

CREATE INDEX idx_trends_global_score
    ON trends (score DESC, fetched_at DESC);

CREATE INDEX idx_trends_source_fetched ON trends (source_id, fetched_at DESC);
CREATE INDEX idx_trends_search    ON trends USING GIN (search_vector);
CREATE INDEX idx_trends_tags      ON trends USING GIN (tags);
CREATE INDEX idx_trends_metadata  ON trends USING GIN (metadata);

COMMENT ON TABLE trends IS
    'Tendencias crudas globales. NO tiene organization_id. Personalización va en trend_relevance.';

-- ============================================================
-- TREND_RELEVANCE (personalización por tenant)
-- ============================================================
CREATE TABLE trend_relevance (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    trend_id        UUID NOT NULL REFERENCES trends(id) ON DELETE CASCADE,
    score           INT NOT NULL DEFAULT 0,
    ai_summary      TEXT,
    tags            TEXT[] NOT NULL DEFAULT '{}',
    evaluated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_trend_relevance UNIQUE (organization_id, trend_id),
    CONSTRAINT chk_trend_relevance_score CHECK (score BETWEEN 0 AND 100)
);

CREATE INDEX idx_trend_relevance_org_score
    ON trend_relevance (organization_id, score DESC, evaluated_at DESC);

CREATE INDEX idx_trend_relevance_tags
    ON trend_relevance USING GIN (tags);

COMMENT ON TABLE trend_relevance IS
    'Score IA y resumen por tenant sobre una tendencia global. No duplica contenido.';

-- Ajustar tipos de columna para coincidir exactamente con las entidades JPA
ALTER TABLE business_profiles 
    ALTER COLUMN digital_maturity TYPE INTEGER,
    ALTER COLUMN ai_maturity TYPE INTEGER;

ALTER TABLE opportunities
    ALTER COLUMN reach_score TYPE INTEGER,
    ALTER COLUMN impact_score TYPE INTEGER,
    ALTER COLUMN effort_score TYPE INTEGER,
    ALTER COLUMN confidence_score TYPE INTEGER;

ALTER TABLE evidence_refs
    ALTER COLUMN weight TYPE INTEGER;

ALTER TABLE organizations
    ALTER COLUMN country TYPE VARCHAR(2);

ALTER TABLE trend_sources
    ALTER COLUMN source_level TYPE VARCHAR(1);

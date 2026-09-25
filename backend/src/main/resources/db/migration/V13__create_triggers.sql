-- ============================================================
-- Trigger updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN
        SELECT unnest(ARRAY[
            'users','organizations','plans','subscriptions',
            'business_profiles','ai_conversations','opportunities',
            'hypotheses','experiments','projects','sprints','tasks','integrations'
        ])
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%s_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
            t, t
        );
    END LOOP;
END $$;

-- ============================================================
-- Trigger search_vector en trends
-- ============================================================
CREATE OR REPLACE FUNCTION trends_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('simple', unaccent(COALESCE(NEW.title, ''))),       'A') ||
        setweight(to_tsvector('simple', unaccent(COALESCE(NEW.description, ''))), 'B') ||
        setweight(to_tsvector('simple', unaccent(array_to_string(NEW.tags, ' '))), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_trends_search_vector
    BEFORE INSERT OR UPDATE OF title, description, tags ON trends
    FOR EACH ROW EXECUTE FUNCTION trends_search_vector_update();

-- ============================================================
-- Trigger member_count
-- ============================================================
CREATE OR REPLACE FUNCTION update_org_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'ACTIVE' THEN
        UPDATE organizations SET member_count = member_count + 1 WHERE id = NEW.organization_id;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'ACTIVE' THEN
        UPDATE organizations SET member_count = member_count - 1 WHERE id = OLD.organization_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status <> NEW.status THEN
        IF NEW.status = 'ACTIVE' THEN
            UPDATE organizations SET member_count = member_count + 1 WHERE id = NEW.organization_id;
        ELSIF OLD.status = 'ACTIVE' THEN
            UPDATE organizations SET member_count = member_count - 1 WHERE id = OLD.organization_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organization_members_count
    AFTER INSERT OR UPDATE OR DELETE ON organization_members
    FOR EACH ROW EXECUTE FUNCTION update_org_member_count();

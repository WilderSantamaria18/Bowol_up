-- Keep the database role constraint aligned with the application role model.
-- PLATFORM_ADMIN remains a platform-level authorization and is not a membership role.
ALTER TABLE organization_members
    DROP CONSTRAINT IF EXISTS chk_organization_members_role;

ALTER TABLE organization_members
    ADD CONSTRAINT chk_organization_members_role
        CHECK (role IN ('OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'STRATEGIST', 'EXECUTOR', 'VIEWER'));

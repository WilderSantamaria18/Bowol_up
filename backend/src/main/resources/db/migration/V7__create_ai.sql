-- ============================================================
-- AI_CONVERSATIONS
-- ============================================================
CREATE TABLE ai_conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    context_type    VARCHAR(30) NOT NULL,
    context_id      UUID,
    title           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    CONSTRAINT chk_ai_conversations_context
        CHECK (context_type IN ('GENERAL','TREND','SWOT','OPPORTUNITY','PROJECT'))
);

CREATE INDEX idx_ai_conversations_org_user
    ON ai_conversations (organization_id, user_id, updated_at DESC);
CREATE INDEX idx_ai_conversations_context
    ON ai_conversations (context_type, context_id)
    WHERE context_id IS NOT NULL;

-- ============================================================
-- AI_MESSAGES
-- ============================================================
CREATE TABLE ai_messages (
    id              BIGSERIAL PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role            VARCHAR(20) NOT NULL,
    content         TEXT NOT NULL,
    tokens_used     INT,
    metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_ai_messages_role
        CHECK (role IN ('SYSTEM','USER','ASSISTANT','TOOL')),
    CONSTRAINT chk_ai_messages_tokens CHECK (tokens_used IS NULL OR tokens_used >= 0)
);

CREATE INDEX idx_ai_messages_conversation
    ON ai_messages (conversation_id, created_at);

-- ============================================================
-- AI_USAGE_LOGS
-- ============================================================
CREATE TABLE ai_usage_logs (
    id              BIGSERIAL PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    operation       VARCHAR(50) NOT NULL,
    provider        VARCHAR(30) NOT NULL,
    model           VARCHAR(60) NOT NULL,
    tokens_input    INT NOT NULL DEFAULT 0,
    tokens_output   INT NOT NULL DEFAULT 0,
    cost_usd        NUMERIC(10,6) NOT NULL DEFAULT 0,
    metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_ai_usage_logs_tokens CHECK (tokens_input >= 0 AND tokens_output >= 0),
    CONSTRAINT chk_ai_usage_logs_cost   CHECK (cost_usd >= 0)
);

CREATE INDEX idx_ai_usage_logs_org_created
    ON ai_usage_logs (organization_id, created_at DESC);
CREATE INDEX idx_ai_usage_logs_operation
    ON ai_usage_logs (organization_id, operation, created_at DESC);

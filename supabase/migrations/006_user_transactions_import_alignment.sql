-- ================================================================
-- PayWise — Migration 006
-- Align user_transactions schema with import + manual transaction APIs
-- Date: 14 March 2026
-- ================================================================

ALTER TABLE user_transactions
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE user_transactions
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_user_transactions_description_len'
    ) THEN
        ALTER TABLE user_transactions
        ADD CONSTRAINT chk_user_transactions_description_len
        CHECK (description IS NULL OR LENGTH(description) <= 500);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_user_transactions_source_values'
    ) THEN
        ALTER TABLE user_transactions
        ADD CONSTRAINT chk_user_transactions_source_values
        CHECK (source IN ('manual', 'sms', 'bank-statement', 'manual-paste'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_transactions_source
ON user_transactions(user_id, source);

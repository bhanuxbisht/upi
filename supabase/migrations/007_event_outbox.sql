-- ============================================================
-- PayWise Phase 4 — Event Outbox for async processing
-- Provides queue-style persistence with retries and idempotency.
-- ============================================================

CREATE TABLE IF NOT EXISTS event_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  aggregate_type TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'dead-letter')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  max_attempts INTEGER NOT NULL DEFAULT 5 CHECK (max_attempts >= 1 AND max_attempts <= 20),
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_error TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_outbox_dispatch
  ON event_outbox(status, next_attempt_at, created_at);

CREATE INDEX IF NOT EXISTS idx_event_outbox_type_created
  ON event_outbox(event_type, created_at DESC);

CREATE OR REPLACE FUNCTION update_event_outbox_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_event_outbox_updated_at ON event_outbox;
CREATE TRIGGER trg_event_outbox_updated_at
  BEFORE UPDATE ON event_outbox
  FOR EACH ROW
  EXECUTE FUNCTION update_event_outbox_updated_at();

ALTER TABLE event_outbox ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'event_outbox'
      AND policyname = 'Users can insert own outbox events'
  ) THEN
    CREATE POLICY "Users can insert own outbox events"
      ON event_outbox
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id IS NULL OR user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'event_outbox'
      AND policyname = 'Users can read own outbox events'
  ) THEN
    CREATE POLICY "Users can read own outbox events"
      ON event_outbox
      FOR SELECT
      TO authenticated
      USING (user_id IS NULL OR user_id = auth.uid());
  END IF;
END $$;

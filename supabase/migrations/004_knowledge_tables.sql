-- ============================================================
-- PayWise Phase 3 — Knowledge Management Tables
-- Migrates hardcoded TypeScript data into Supabase for admin CRUD
-- ============================================================

-- 1. Credit Cards Knowledge
CREATE TABLE IF NOT EXISTS knowledge_credit_cards (
  id TEXT PRIMARY KEY,                        -- e.g., "hdfc-regalia"
  bank TEXT NOT NULL,
  name TEXT NOT NULL,
  annual_fee NUMERIC NOT NULL DEFAULT 0,
  fee_waiver TEXT,                            -- e.g., "Waived on ₹3L annual spend"
  joining_fee NUMERIC NOT NULL DEFAULT 0,
  network TEXT NOT NULL CHECK (network IN ('Visa', 'Mastercard', 'RuPay', 'Amex', 'Diners')),
  tier TEXT NOT NULL CHECK (tier IN ('entry', 'mid', 'premium', 'super-premium')),
  rewards JSONB NOT NULL DEFAULT '[]',        -- Array of CreditCardReward objects
  lounge_access TEXT,
  fuel_surcharge_waiver BOOLEAN NOT NULL DEFAULT false,
  best_for TEXT[] NOT NULL DEFAULT '{}',
  affiliate_link TEXT,
  affiliate_payout NUMERIC,
  income_requirement TEXT,
  pros TEXT[] NOT NULL DEFAULT '{}',
  cons TEXT[] NOT NULL DEFAULT '{}',
  -- Metadata for freshness tracking
  is_active BOOLEAN NOT NULL DEFAULT true,
  confidence_level TEXT DEFAULT 'verified' CHECK (confidence_level IN ('verified', 'community', 'unverified')),
  source_url TEXT,
  last_verified_date TIMESTAMPTZ DEFAULT NOW(),
  verified_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. UPI Apps Knowledge
CREATE TABLE IF NOT EXISTS knowledge_upi_apps (
  id TEXT PRIMARY KEY,                        -- e.g., "phonepe"
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  market_share NUMERIC,                       -- percentage
  monthly_active_users TEXT,                  -- e.g., "450M+"
  color TEXT NOT NULL DEFAULT '#000000',
  strength_categories TEXT[] NOT NULL DEFAULT '{}',
  weak_categories TEXT[] NOT NULL DEFAULT '{}',
  reward_tiers JSONB NOT NULL DEFAULT '[]',   -- Array of UPIRewardTier objects
  linked_card_benefits TEXT[] NOT NULL DEFAULT '{}',
  strategies TEXT[] NOT NULL DEFAULT '{}',     -- Expert tips for maximizing savings
  recurring_payment_support BOOLEAN NOT NULL DEFAULT false,
  auto_pay_support BOOLEAN NOT NULL DEFAULT false,
  credit_card_link_support BOOLEAN NOT NULL DEFAULT false,
  split_bill_support BOOLEAN NOT NULL DEFAULT false,
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  confidence_level TEXT DEFAULT 'verified' CHECK (confidence_level IN ('verified', 'community', 'unverified')),
  source_url TEXT,
  last_verified_date TIMESTAMPTZ DEFAULT NOW(),
  verified_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Payment Strategies Knowledge
CREATE TABLE IF NOT EXISTS knowledge_strategies (
  id TEXT PRIMARY KEY,                        -- e.g., "food-stack"
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'advanced')),
  monthly_savings_min NUMERIC NOT NULL DEFAULT 0,
  monthly_savings_max NUMERIC NOT NULL DEFAULT 0,
  steps TEXT[] NOT NULL DEFAULT '{}',
  requirements TEXT[] NOT NULL DEFAULT '{}',
  warnings TEXT[] NOT NULL DEFAULT '{}',
  applicable_to TEXT[] NOT NULL DEFAULT '{}',
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  confidence_level TEXT DEFAULT 'verified' CHECK (confidence_level IN ('verified', 'community', 'unverified')),
  source_url TEXT,
  last_verified_date TIMESTAMPTZ DEFAULT NOW(),
  verified_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_knowledge_cards_bank ON knowledge_credit_cards(bank);
CREATE INDEX IF NOT EXISTS idx_knowledge_cards_tier ON knowledge_credit_cards(tier);
CREATE INDEX IF NOT EXISTS idx_knowledge_cards_active ON knowledge_credit_cards(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_upi_slug ON knowledge_upi_apps(slug);
CREATE INDEX IF NOT EXISTS idx_knowledge_upi_active ON knowledge_upi_apps(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_strategies_category ON knowledge_strategies(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_strategies_active ON knowledge_strategies(is_active);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_knowledge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_knowledge_cards_updated_at
  BEFORE UPDATE ON knowledge_credit_cards
  FOR EACH ROW EXECUTE FUNCTION update_knowledge_updated_at();

CREATE TRIGGER trg_knowledge_upi_updated_at
  BEFORE UPDATE ON knowledge_upi_apps
  FOR EACH ROW EXECUTE FUNCTION update_knowledge_updated_at();

CREATE TRIGGER trg_knowledge_strategies_updated_at
  BEFORE UPDATE ON knowledge_strategies
  FOR EACH ROW EXECUTE FUNCTION update_knowledge_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE knowledge_credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_upi_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_strategies ENABLE ROW LEVEL SECURITY;

-- Public READ for active records (AI + frontend needs this)
CREATE POLICY "Anyone can read active credit cards"
  ON knowledge_credit_cards FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can read active UPI apps"
  ON knowledge_upi_apps FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can read active strategies"
  ON knowledge_strategies FOR SELECT
  USING (is_active = true);

-- Admin writes are done via service_role key (bypasses RLS)
-- No INSERT/UPDATE/DELETE policies needed for public users


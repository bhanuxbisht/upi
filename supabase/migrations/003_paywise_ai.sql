-- Migration: PayWise AI — Personal Finance Intelligence
-- Created: 2026-03-04
-- Purpose: User profiles, transaction tracking, AI chat, personalized offers,
--          audit logging, and DPDP consent management
-- Prerequisites: schema.sql (run first), 002_user_savings.sql (run second)

-- =====================================================
-- 1. USER PROFILES (Payment Preferences & Onboarding)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Payment preferences
    preferred_apps TEXT[] DEFAULT '{}',               -- ['phonepe', 'googlepay']
    cards JSONB DEFAULT '[]',                          -- [{bank:'HDFC', type:'credit', name:'Millennia', last4:'1234'}]
    wallets JSONB DEFAULT '[]',                        -- [{app:'paytm', balance: 450}]
    
    -- Budgeting
    monthly_budget DECIMAL(10, 2) CHECK (monthly_budget IS NULL OR (monthly_budget > 0 AND monthly_budget <= 10000000)),
    category_budgets JSONB DEFAULT '{}',               -- {food: 5000, shopping: 3000}
    
    -- Personalization
    notification_preferences JSONB DEFAULT '{"email_alerts": true, "push_alerts": false, "weekly_report": true, "deal_expiry": true}',
    spending_goals JSONB DEFAULT '{}',                 -- {monthly_savings_target: 2000}
    
    -- Status
    onboarding_completed BOOLEAN DEFAULT FALSE,
    pro_user BOOLEAN DEFAULT FALSE,                    -- Premium subscription flag
    pro_expires_at TIMESTAMPTZ,                        -- When Pro subscription expires
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_pro ON user_profiles(pro_user) WHERE pro_user = TRUE;

-- =====================================================
-- 2. USER TRANSACTIONS (Spending History & Journal)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Transaction details
    merchant_name TEXT NOT NULL CHECK (LENGTH(merchant_name) <= 200),
    category TEXT NOT NULL CHECK (LENGTH(category) <= 100),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0 AND amount <= 10000000),
    
    -- Payment method
    payment_app TEXT NOT NULL CHECK (LENGTH(payment_app) <= 100),
    payment_method TEXT CHECK (payment_method IS NULL OR payment_method IN ('upi', 'credit_card', 'debit_card', 'wallet', 'bnpl', 'net_banking')),
    card_used TEXT CHECK (card_used IS NULL OR LENGTH(card_used) <= 200),
    
    -- Savings info
    cashback_received DECIMAL(10, 2) DEFAULT 0 CHECK (cashback_received >= 0 AND cashback_received <= 100000),
    offer_used_id UUID REFERENCES offers(id) ON DELETE SET NULL,
    could_have_saved DECIMAL(10, 2) DEFAULT 0,         -- "Missed savings" amount
    optimal_app TEXT,                                    -- What they SHOULD have used
    
    -- Metadata
    notes TEXT CHECK (notes IS NULL OR LENGTH(notes) <= 500),
    transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_date ON user_transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_transactions_category ON user_transactions(user_id, category);
CREATE INDEX IF NOT EXISTS idx_user_transactions_merchant ON user_transactions(user_id, merchant_name);

-- =====================================================
-- 3. AI CONVERSATIONS (Chat History & Memory)
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Conversation data
    title TEXT DEFAULT 'New conversation' CHECK (LENGTH(title) <= 200),
    messages JSONB NOT NULL DEFAULT '[]',               -- [{role:'user'|'assistant', content:'...', timestamp:'...'}]
    
    -- LLM context
    context_summary TEXT,                               -- LLM-generated summary for context window
    total_tokens_used INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_active ON ai_conversations(user_id, is_active) WHERE is_active = TRUE;

-- =====================================================
-- 4. USER OFFER MATCHES (Personalized Recommendations)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_offer_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    
    -- Match scoring
    match_score DECIMAL(5, 2) NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    match_reasons TEXT[] DEFAULT '{}',                  -- ['You use PhonePe', 'You shop at Swiggy frequently']
    
    -- Notification tracking
    notified BOOLEAN DEFAULT FALSE,
    notified_at TIMESTAMPTZ,
    clicked BOOLEAN DEFAULT FALSE,
    clicked_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, offer_id)
);

CREATE INDEX IF NOT EXISTS idx_user_offer_matches_user ON user_offer_matches(user_id, match_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_offer_matches_unnotified ON user_offer_matches(user_id, notified) WHERE notified = FALSE;

-- =====================================================
-- 5. AUDIT LOGS (Security & Compliance)
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Action details
    action TEXT NOT NULL CHECK (LENGTH(action) <= 100),
    resource_type TEXT NOT NULL CHECK (LENGTH(resource_type) <= 50),
    resource_id TEXT CHECK (resource_id IS NULL OR LENGTH(resource_id) <= 100),
    
    -- Request context
    ip_address INET,
    user_agent TEXT CHECK (user_agent IS NULL OR LENGTH(user_agent) <= 500),
    
    -- Additional data
    metadata JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- =====================================================
-- 6. CONSENT RECORDS (DPDP Act 2023 Compliance)
-- =====================================================
CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Consent details
    consent_type TEXT NOT NULL CHECK (consent_type IN ('data_collection', 'analytics', 'marketing', 'third_party_sharing', 'ai_processing')),
    granted BOOLEAN NOT NULL,
    
    -- Audit trail
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    ip_address INET,
    consent_version TEXT NOT NULL DEFAULT '1.0',
    consent_text TEXT NOT NULL CHECK (LENGTH(consent_text) <= 5000),
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consent_records_user ON consent_records(user_id, consent_type);
CREATE INDEX IF NOT EXISTS idx_consent_records_active ON consent_records(user_id, granted) WHERE granted = TRUE;

-- =====================================================
-- 7. AI USAGE TRACKING (Rate Limiting & Cost Control)
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Usage metrics
    query_date DATE NOT NULL DEFAULT CURRENT_DATE,
    queries_used INTEGER NOT NULL DEFAULT 0,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    
    -- Limits
    daily_limit INTEGER NOT NULL DEFAULT 3,             -- Free: 3, Pro: unlimited (set to 99999)
    
    UNIQUE(user_id, query_date)
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON ai_usage(user_id, query_date DESC);

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS) — ALL NEW TABLES
-- =====================================================

-- User Profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- User Transactions
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON user_transactions;
CREATE POLICY "Users can view own transactions"
    ON user_transactions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON user_transactions;
CREATE POLICY "Users can insert own transactions"
    ON user_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON user_transactions;
CREATE POLICY "Users can update own transactions"
    ON user_transactions FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON user_transactions;
CREATE POLICY "Users can delete own transactions"
    ON user_transactions FOR DELETE
    USING (auth.uid() = user_id);

-- AI Conversations
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own conversations" ON ai_conversations;
CREATE POLICY "Users can view own conversations"
    ON ai_conversations FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own conversations" ON ai_conversations;
CREATE POLICY "Users can insert own conversations"
    ON ai_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own conversations" ON ai_conversations;
CREATE POLICY "Users can update own conversations"
    ON ai_conversations FOR UPDATE
    USING (auth.uid() = user_id);

-- User Offer Matches
ALTER TABLE user_offer_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own offer matches" ON user_offer_matches;
CREATE POLICY "Users can view own offer matches"
    ON user_offer_matches FOR SELECT
    USING (auth.uid() = user_id);

-- AI Usage
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own ai usage" ON ai_usage;
CREATE POLICY "Users can view own ai usage"
    ON ai_usage FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own ai usage" ON ai_usage;
CREATE POLICY "Users can insert own ai usage"
    ON ai_usage FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own ai usage" ON ai_usage;
CREATE POLICY "Users can update own ai usage"
    ON ai_usage FOR UPDATE
    USING (auth.uid() = user_id);

-- Consent Records
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own consent" ON consent_records;
CREATE POLICY "Users can view own consent"
    ON consent_records FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own consent" ON consent_records;
CREATE POLICY "Users can insert own consent"
    ON consent_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own consent" ON consent_records;
CREATE POLICY "Users can update own consent"
    ON consent_records FOR UPDATE
    USING (auth.uid() = user_id);

-- Audit Logs — admins only, users can see their own
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;
CREATE POLICY "Users can view own audit logs"
    ON audit_logs FOR SELECT
    USING (auth.uid() = user_id);

-- =====================================================
-- 9. HELPER FUNCTIONS
-- =====================================================

-- Auto-calculate "could_have_saved" when a transaction is logged
CREATE OR REPLACE FUNCTION calculate_missed_savings()
RETURNS TRIGGER AS $$
DECLARE
    best_offer RECORD;
BEGIN
    -- Find the best offer for this merchant + amount
    SELECT 
        pa.name as app_name,
        COALESCE(
            o.cashback_amount,
            LEAST(
                NEW.amount * COALESCE(o.cashback_percent, 0) / 100,
                COALESCE(o.max_cashback, 999999)
            )
        ) as potential_savings
    INTO best_offer
    FROM offers o
    JOIN merchants m ON o.merchant_id = m.id
    JOIN payment_apps pa ON o.payment_app_id = pa.id
    WHERE m.name ILIKE '%' || NEW.merchant_name || '%'
      AND o.status = 'active'
      AND o.valid_to >= NOW()
      AND (o.min_transaction IS NULL OR o.min_transaction <= NEW.amount)
    ORDER BY potential_savings DESC
    LIMIT 1;
    
    IF best_offer IS NOT NULL AND best_offer.potential_savings > COALESCE(NEW.cashback_received, 0) THEN
        NEW.could_have_saved := best_offer.potential_savings - COALESCE(NEW.cashback_received, 0);
        NEW.optimal_app := best_offer.app_name;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_missed_savings ON user_transactions;
CREATE TRIGGER trigger_calculate_missed_savings
    BEFORE INSERT ON user_transactions
    FOR EACH ROW
    EXECUTE FUNCTION calculate_missed_savings();

-- Auto-update user_profiles.updated_at
CREATE OR REPLACE FUNCTION update_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_profile_timestamp ON user_profiles;
CREATE TRIGGER trigger_update_profile_timestamp
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_timestamp();

-- =====================================================
-- 10. SPENDING ANALYTICS VIEWS
-- =====================================================

-- View: Monthly spending by category
CREATE OR REPLACE VIEW user_monthly_spending AS
SELECT 
    user_id,
    DATE_TRUNC('month', transaction_date) as month,
    category,
    COUNT(*) as transaction_count,
    SUM(amount) as total_spent,
    SUM(cashback_received) as total_cashback,
    SUM(could_have_saved) as total_missed_savings,
    AVG(amount) as avg_transaction
FROM user_transactions
GROUP BY user_id, DATE_TRUNC('month', transaction_date), category;

-- View: Payment app usage stats
CREATE OR REPLACE VIEW user_payment_app_usage AS
SELECT 
    user_id,
    payment_app,
    COUNT(*) as transaction_count,
    SUM(amount) as total_spent,
    SUM(cashback_received) as total_cashback,
    ROUND(COUNT(*)::DECIMAL / SUM(COUNT(*)) OVER (PARTITION BY user_id) * 100, 1) as usage_percentage
FROM user_transactions
GROUP BY user_id, payment_app;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Run this AFTER schema.sql and 002_user_savings.sql
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Set up API routes for profiles, transactions, AI chat
-- 3. Add GOOGLE_AI_API_KEY to .env.local
-- 4. Build UI components

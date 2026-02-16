-- Migration: User Savings Tracking System
-- Created: 2026-02-16
-- Purpose: Track individual savings events and calculate user statistics

-- =====================================================
-- 1. USER_SAVINGS TABLE
-- =====================================================
-- Stores each individual "I used this offer" event
CREATE TABLE IF NOT EXISTS user_savings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
    
    -- What they saved
    amount_saved DECIMAL(10, 2) NOT NULL CHECK (amount_saved > 0 AND amount_saved <= 100000),
    transaction_amount DECIMAL(10, 2) CHECK (transaction_amount >= 0 AND transaction_amount <= 10000000),
    
    -- Where and how
    merchant_name TEXT NOT NULL CHECK (LENGTH(merchant_name) <= 200),
    payment_app_name TEXT NOT NULL CHECK (LENGTH(payment_app_name) <= 200),
    category TEXT CHECK (category IS NULL OR LENGTH(category) <= 100),
    
    -- Metadata
    notes TEXT CHECK (notes IS NULL OR LENGTH(notes) <= 500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_savings_user_id ON user_savings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_savings_created_at ON user_savings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_savings_user_date ON user_savings(user_id, created_at DESC);

-- =====================================================
-- 2. USER_SAVINGS_STATS TABLE (Materialized View Alternative)
-- =====================================================
-- Pre-computed stats for fast dashboard loading
CREATE TABLE IF NOT EXISTS user_savings_stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Totals
    total_saved DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_transactions INTEGER NOT NULL DEFAULT 0,
    
    -- Time-based
    saved_this_week DECIMAL(10, 2) NOT NULL DEFAULT 0,
    saved_this_month DECIMAL(10, 2) NOT NULL DEFAULT 0,
    saved_this_year DECIMAL(10, 2) NOT NULL DEFAULT 0,
    
    -- Streaks
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_activity_date DATE,
    
    -- Metadata
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_savings_stats_total ON user_savings_stats(total_saved DESC);

-- =====================================================
-- 3. FUNCTION: Update User Stats After Saving
-- =====================================================
CREATE OR REPLACE FUNCTION update_user_savings_stats()
RETURNS TRIGGER AS $$
DECLARE
    week_start DATE := DATE_TRUNC('week', NOW())::DATE;
    month_start DATE := DATE_TRUNC('month', NOW())::DATE;
    year_start DATE := DATE_TRUNC('year', NOW())::DATE;
BEGIN
    -- Insert or update stats
    INSERT INTO user_savings_stats (
        user_id,
        total_saved,
        total_transactions,
        saved_this_week,
        saved_this_month,
        saved_this_year,
        last_activity_date,
        updated_at
    )
    VALUES (
        NEW.user_id,
        NEW.amount_saved,
        1,
        CASE WHEN NEW.created_at::DATE >= week_start THEN NEW.amount_saved ELSE 0 END,
        CASE WHEN NEW.created_at::DATE >= month_start THEN NEW.amount_saved ELSE 0 END,
        CASE WHEN NEW.created_at::DATE >= year_start THEN NEW.amount_saved ELSE 0 END,
        NEW.created_at::DATE,
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_saved = user_savings_stats.total_saved + NEW.amount_saved,
        total_transactions = user_savings_stats.total_transactions + 1,
        saved_this_week = CASE 
            WHEN NEW.created_at::DATE >= week_start 
            THEN user_savings_stats.saved_this_week + NEW.amount_saved 
            ELSE user_savings_stats.saved_this_week 
        END,
        saved_this_month = CASE 
            WHEN NEW.created_at::DATE >= month_start 
            THEN user_savings_stats.saved_this_month + NEW.amount_saved 
            ELSE user_savings_stats.saved_this_month 
        END,
        saved_this_year = CASE 
            WHEN NEW.created_at::DATE >= year_start 
            THEN user_savings_stats.saved_this_year + NEW.amount_saved 
            ELSE user_savings_stats.saved_this_year 
        END,
        last_activity_date = NEW.created_at::DATE,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update stats
DROP TRIGGER IF EXISTS trigger_update_user_savings_stats ON user_savings;
CREATE TRIGGER trigger_update_user_savings_stats
    AFTER INSERT ON user_savings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_savings_stats();

-- =====================================================
-- 4. FUNCTION: Reset Weekly/Monthly Stats (Cron Job)
-- =====================================================
CREATE OR REPLACE FUNCTION reset_periodic_savings_stats()
RETURNS void AS $$
DECLARE
    week_start DATE := DATE_TRUNC('week', NOW())::DATE;
    month_start DATE := DATE_TRUNC('month', NOW())::DATE;
BEGIN
    -- Reset weekly stats if it's Monday
    IF EXTRACT(DOW FROM NOW()) = 1 THEN
        UPDATE user_savings_stats SET saved_this_week = 0;
    END IF;
    
    -- Reset monthly stats if it's the 1st
    IF EXTRACT(DAY FROM NOW()) = 1 THEN
        UPDATE user_savings_stats SET saved_this_month = 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE user_savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_savings_stats ENABLE ROW LEVEL SECURITY;

-- Users can only see their own savings
DROP POLICY IF EXISTS "Users can view own savings" ON user_savings;
CREATE POLICY "Users can view own savings"
    ON user_savings FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own savings" ON user_savings;
CREATE POLICY "Users can insert own savings"
    ON user_savings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only see their own stats
DROP POLICY IF EXISTS "Users can view own stats" ON user_savings_stats;
CREATE POLICY "Users can view own stats"
    ON user_savings_stats FOR SELECT
    USING (auth.uid() = user_id);

-- =====================================================
-- 6. HELPER VIEWS
-- =====================================================

-- View: Top savers leaderboard (anonymous)
CREATE OR REPLACE VIEW top_savers AS
SELECT 
    ROW_NUMBER() OVER (ORDER BY total_saved DESC) as rank,
    LEFT(MD5(user_id::TEXT), 8) as anonymous_id,
    total_saved,
    total_transactions,
    current_streak
FROM user_savings_stats
ORDER BY total_saved DESC
LIMIT 100;

-- View: Recent savings activity (for user's own history)
CREATE OR REPLACE VIEW recent_savings_activity AS
SELECT 
    us.id,
    us.user_id,
    us.amount_saved,
    us.transaction_amount,
    us.merchant_name,
    us.payment_app_name,
    us.category,
    us.created_at,
    o.title as offer_title
FROM user_savings us
LEFT JOIN offers o ON us.offer_id = o.id
ORDER BY us.created_at DESC;

-- =====================================================
-- 7. SAMPLE DATA (for testing)
-- =====================================================
-- This will be populated by real user actions in production
-- Uncomment below to add test data for development

/*
-- Insert test savings for a demo user
INSERT INTO user_savings (user_id, offer_id, amount_saved, transaction_amount, merchant_name, payment_app_name, category, created_at)
VALUES 
    -- Replace with actual user_id from auth.users
    ('YOUR_USER_ID_HERE', NULL, 75.00, 500.00, 'Swiggy', 'PhonePe', 'Food Delivery', NOW() - INTERVAL '1 day'),
    ('YOUR_USER_ID_HERE', NULL, 120.00, 2000.00, 'Amazon', 'Amazon Pay', 'Shopping', NOW() - INTERVAL '2 days'),
    ('YOUR_USER_ID_HERE', NULL, 50.00, 800.00, 'BigBasket', 'Google Pay', 'Groceries', NOW() - INTERVAL '3 days');
*/

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Create API routes for tracking savings
-- 3. Build UI components for savings counter
-- 4. Set up cron job for reset_periodic_savings_stats()

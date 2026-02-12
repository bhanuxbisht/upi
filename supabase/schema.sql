-- PayWise Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT '💳',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Merchants
CREATE TABLE merchants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  logo_url TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_merchants_slug ON merchants(slug);
CREATE INDEX idx_merchants_category ON merchants(category_id);

-- Payment Apps
CREATE TABLE payment_apps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('upi', 'credit_card', 'debit_card', 'wallet', 'bnpl')),
  logo_url TEXT,
  color TEXT NOT NULL DEFAULT '#000000',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offers (core table)
CREATE TABLE offers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  payment_app_id UUID NOT NULL REFERENCES payment_apps(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('cashback', 'discount', 'reward_points', 'coupon', 'bogo')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cashback_amount NUMERIC,
  cashback_percent NUMERIC,
  max_cashback NUMERIC,
  min_transaction NUMERIC,
  promo_code TEXT,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_to TIMESTAMPTZ NOT NULL,
  terms TEXT,
  source_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending', 'rejected')),
  verified_count INTEGER DEFAULT 0,
  downvote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_valid_to ON offers(valid_to);
CREATE INDEX idx_offers_merchant ON offers(merchant_id);
CREATE INDEX idx_offers_payment_app ON offers(payment_app_id);
CREATE INDEX idx_offers_type ON offers(type);

-- Full-text search index on offer title and description
ALTER TABLE offers ADD COLUMN search_vector TSVECTOR
  GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || description)) STORED;
CREATE INDEX idx_offers_search ON offers USING GIN(search_vector);

-- User payment methods (what apps/cards a user has)
CREATE TABLE user_payment_methods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_app_id UUID NOT NULL REFERENCES payment_apps(id) ON DELETE CASCADE,
  card_name TEXT,
  card_bank TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, payment_app_id, card_name)
);

CREATE INDEX idx_user_payments_user ON user_payment_methods(user_id);

-- Offer submissions (community crowdsource)
CREATE TABLE offer_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  merchant_name TEXT NOT NULL,
  payment_app_name TEXT NOT NULL,
  offer_title TEXT NOT NULL,
  offer_description TEXT NOT NULL,
  cashback_amount NUMERIC,
  cashback_percent NUMERIC,
  max_cashback NUMERIC,
  min_transaction NUMERIC,
  promo_code TEXT,
  valid_to TIMESTAMPTZ,
  source_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_submissions_status ON offer_submissions(status);

-- Offer verifications (upvote/downvote)
CREATE TABLE offer_verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_valid BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(offer_id, user_id)
);

-- Waitlist (pre-launch email collection)
CREATE TABLE waitlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  apps_used TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on offers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-expire offers past valid_to (can be called via cron/pg_cron)
CREATE OR REPLACE FUNCTION expire_old_offers()
RETURNS void AS $$
BEGIN
  UPDATE offers
  SET status = 'expired'
  WHERE status = 'active' AND valid_to < NOW();
END;
$$ LANGUAGE plpgsql;

-- Row-Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Public read for reference tables (categories, merchants, payment_apps)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Merchants are viewable by everyone"
  ON merchants FOR SELECT USING (true);

CREATE POLICY "Payment apps are viewable by everyone"
  ON payment_apps FOR SELECT USING (true);

-- Public read for offers (anyone can browse)
CREATE POLICY "Offers are viewable by everyone"
  ON offers FOR SELECT USING (true);

-- Authenticated users can submit offers
CREATE POLICY "Authenticated users can submit offers"
  ON offer_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own submissions"
  ON offer_submissions FOR SELECT
  USING (auth.uid() = user_id);

-- Authenticated users can verify offers (one vote per offer)
CREATE POLICY "Authenticated users can verify offers"
  ON offer_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Verifications are viewable by everyone"
  ON offer_verifications FOR SELECT USING (true);

-- Users manage their own payment methods only
CREATE POLICY "Users manage own payment methods"
  ON user_payment_methods FOR ALL
  USING (auth.uid() = user_id);

-- Anyone can join waitlist (insert only, no read)
CREATE POLICY "Anyone can join waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (true);

-- ============================================
-- REFERENCE DATA: Categories & Payment Apps
-- These are REAL — not demo/fake data
-- ============================================

INSERT INTO categories (name, slug, icon) VALUES
  ('Food Delivery', 'food-delivery', '🍕'),
  ('Groceries', 'groceries', '🛒'),
  ('Shopping', 'shopping', '🛍️'),
  ('Bills & Recharges', 'bills-recharges', '⚡'),
  ('Travel', 'travel', '✈️'),
  ('Entertainment', 'entertainment', '🎬'),
  ('Health & Pharmacy', 'health-pharmacy', '💊'),
  ('Fuel', 'fuel', '⛽'),
  ('Education', 'education', '📚'),
  ('Other', 'other', '💳');

INSERT INTO payment_apps (name, slug, type, color) VALUES
  ('PhonePe', 'phonepe', 'upi', '#5F259F'),
  ('Google Pay', 'google-pay', 'upi', '#4285F4'),
  ('Paytm', 'paytm', 'upi', '#00BAF2'),
  ('Amazon Pay', 'amazon-pay', 'wallet', '#FF9900'),
  ('CRED', 'cred', 'upi', '#1A1A2E'),
  ('WhatsApp Pay', 'whatsapp-pay', 'upi', '#25D366'),
  ('BHIM', 'bhim', 'upi', '#00796B'),
  ('Freecharge', 'freecharge', 'wallet', '#7B2D8E'),
  ('Mobikwik', 'mobikwik', 'wallet', '#2196F3');

-- Real merchants in India (no fake offers attached)
INSERT INTO merchants (name, slug, category_id) VALUES
  ('Swiggy', 'swiggy', (SELECT id FROM categories WHERE slug = 'food-delivery')),
  ('Zomato', 'zomato', (SELECT id FROM categories WHERE slug = 'food-delivery')),
  ('Amazon', 'amazon', (SELECT id FROM categories WHERE slug = 'shopping')),
  ('Flipkart', 'flipkart', (SELECT id FROM categories WHERE slug = 'shopping')),
  ('Myntra', 'myntra', (SELECT id FROM categories WHERE slug = 'shopping')),
  ('Nykaa', 'nykaa', (SELECT id FROM categories WHERE slug = 'shopping')),
  ('BigBasket', 'bigbasket', (SELECT id FROM categories WHERE slug = 'groceries')),
  ('Blinkit', 'blinkit', (SELECT id FROM categories WHERE slug = 'groceries')),
  ('Zepto', 'zepto', (SELECT id FROM categories WHERE slug = 'groceries')),
  ('Jio', 'jio', (SELECT id FROM categories WHERE slug = 'bills-recharges')),
  ('Airtel', 'airtel', (SELECT id FROM categories WHERE slug = 'bills-recharges')),
  ('Vi', 'vi', (SELECT id FROM categories WHERE slug = 'bills-recharges')),
  ('MakeMyTrip', 'makemytrip', (SELECT id FROM categories WHERE slug = 'travel')),
  ('IRCTC', 'irctc', (SELECT id FROM categories WHERE slug = 'travel')),
  ('Ola', 'ola', (SELECT id FROM categories WHERE slug = 'travel')),
  ('Uber', 'uber', (SELECT id FROM categories WHERE slug = 'travel')),
  ('Rapido', 'rapido', (SELECT id FROM categories WHERE slug = 'travel')),
  ('BookMyShow', 'bookmyshow', (SELECT id FROM categories WHERE slug = 'entertainment')),
  ('Starbucks', 'starbucks', (SELECT id FROM categories WHERE slug = 'food-delivery')),
  ('PharmEasy', 'pharmeasy', (SELECT id FROM categories WHERE slug = 'health-pharmacy')),
  ('1mg', '1mg', (SELECT id FROM categories WHERE slug = 'health-pharmacy')),
  ('Indian Oil', 'indian-oil', (SELECT id FROM categories WHERE slug = 'fuel')),
  ('HP Petrol', 'hp-petrol', (SELECT id FROM categories WHERE slug = 'fuel'));

-- ================================================================
-- PayWise — Smart Retrieval: Full-Text Search + pgvector
-- Phase 3, Build 3-4
-- Run this in Supabase SQL Editor AFTER 004_knowledge_tables.sql
-- ================================================================

-- ================================================================
-- PART A: FULL-TEXT SEARCH ON KNOWLEDGE TABLES
-- This gives us keyword matching — massive upgrade over regex
-- ================================================================

-- 1. Credit Cards — search across bank, name, best_for, pros, cons
ALTER TABLE knowledge_credit_cards 
ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

-- Populate search vector from multiple fields
CREATE OR REPLACE FUNCTION knowledge_cc_search_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.bank, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.tier, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.network, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.best_for, ' '), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.pros, ' '), '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.cons, ' '), '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(NEW.income_requirement, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_knowledge_cc_search 
  BEFORE INSERT OR UPDATE ON knowledge_credit_cards
  FOR EACH ROW EXECUTE FUNCTION knowledge_cc_search_update();

-- Backfill search_vector for existing rows
UPDATE knowledge_credit_cards SET updated_at = NOW();

CREATE INDEX IF NOT EXISTS idx_knowledge_cc_search ON knowledge_credit_cards USING GIN(search_vector);

-- 2. UPI Apps — search across name, strength categories, strategies
ALTER TABLE knowledge_upi_apps 
ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

CREATE OR REPLACE FUNCTION knowledge_upi_search_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.slug, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.strength_categories, ' '), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.weak_categories, ' '), '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.strategies, ' '), '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.linked_card_benefits, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_knowledge_upi_search 
  BEFORE INSERT OR UPDATE ON knowledge_upi_apps
  FOR EACH ROW EXECUTE FUNCTION knowledge_upi_search_update();

UPDATE knowledge_upi_apps SET updated_at = NOW();

CREATE INDEX IF NOT EXISTS idx_knowledge_upi_search ON knowledge_upi_apps USING GIN(search_vector);

-- 3. Strategies — search across title, category, steps, requirements
ALTER TABLE knowledge_strategies 
ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

CREATE OR REPLACE FUNCTION knowledge_strategy_search_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.difficulty, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.steps, ' '), '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.requirements, ' '), '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.applicable_to, ' '), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.warnings, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_knowledge_strategy_search 
  BEFORE INSERT OR UPDATE ON knowledge_strategies
  FOR EACH ROW EXECUTE FUNCTION knowledge_strategy_search_update();

UPDATE knowledge_strategies SET updated_at = NOW();

CREATE INDEX IF NOT EXISTS idx_knowledge_strategy_search ON knowledge_strategies USING GIN(search_vector);


-- ================================================================
-- PART B: ENABLE pgvector FOR SEMANTIC SEARCH
-- Supabase has pgvector pre-installed, just enable extension
-- ================================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- Add 384-dimension embedding columns (matches all-MiniLM-L6-v2 model)
ALTER TABLE knowledge_credit_cards 
ADD COLUMN IF NOT EXISTS embedding vector(384);

ALTER TABLE knowledge_upi_apps 
ADD COLUMN IF NOT EXISTS embedding vector(384);

ALTER TABLE knowledge_strategies 
ADD COLUMN IF NOT EXISTS embedding vector(384);

-- HNSW indexes for fast similarity search (better than IVFFlat for < 100k rows)
CREATE INDEX IF NOT EXISTS idx_knowledge_cc_embedding 
  ON knowledge_credit_cards USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_knowledge_upi_embedding 
  ON knowledge_upi_apps USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_knowledge_strategy_embedding 
  ON knowledge_strategies USING hnsw (embedding vector_cosine_ops);


-- ================================================================
-- PART C: SEARCH FUNCTIONS (callable from Supabase client)
-- ================================================================

-- Full-text search across all knowledge tables
-- Returns ranked results from all 3 tables combined
CREATE OR REPLACE FUNCTION search_knowledge(
  query_text TEXT,
  match_limit INT DEFAULT 10
) RETURNS TABLE(
  source TEXT,
  item_id TEXT,
  title TEXT,
  relevance FLOAT4
) AS $$
BEGIN
  RETURN QUERY
  WITH search_query AS (
    SELECT plainto_tsquery('english', query_text) AS q
  )
  -- Credit cards
  SELECT 
    'credit_card'::TEXT AS source,
    cc.id AS item_id,
    (cc.bank || ' ' || cc.name)::TEXT AS title,
    ts_rank_cd(cc.search_vector, sq.q)::FLOAT4 AS relevance
  FROM knowledge_credit_cards cc, search_query sq
  WHERE cc.is_active = true 
    AND cc.search_vector @@ sq.q
  
  UNION ALL
  
  -- UPI Apps
  SELECT 
    'upi_app'::TEXT AS source,
    ua.id AS item_id,
    ua.name::TEXT AS title,
    ts_rank_cd(ua.search_vector, sq.q)::FLOAT4 AS relevance
  FROM knowledge_upi_apps ua, search_query sq
  WHERE ua.is_active = true 
    AND ua.search_vector @@ sq.q
  
  UNION ALL
  
  -- Strategies
  SELECT 
    'strategy'::TEXT AS source,
    s.id AS item_id,
    s.title::TEXT AS title,
    ts_rank_cd(s.search_vector, sq.q)::FLOAT4 AS relevance
  FROM knowledge_strategies s, search_query sq
  WHERE s.is_active = true 
    AND s.search_vector @@ sq.q
  
  ORDER BY relevance DESC
  LIMIT match_limit;
END;
$$ LANGUAGE plpgsql STABLE;


-- Vector similarity search across all knowledge tables
-- Uses cosine similarity (1 - cosine_distance)
CREATE OR REPLACE FUNCTION search_knowledge_vectors(
  query_embedding vector(384),
  match_limit INT DEFAULT 10,
  similarity_threshold FLOAT DEFAULT 0.3
) RETURNS TABLE(
  source TEXT,
  item_id TEXT,
  title TEXT,
  similarity FLOAT4
) AS $$
BEGIN
  RETURN QUERY
  -- Credit cards
  SELECT 
    'credit_card'::TEXT AS source,
    cc.id AS item_id,
    (cc.bank || ' ' || cc.name)::TEXT AS title,
    (1 - (cc.embedding <=> query_embedding))::FLOAT4 AS similarity
  FROM knowledge_credit_cards cc
  WHERE cc.is_active = true 
    AND cc.embedding IS NOT NULL
    AND (1 - (cc.embedding <=> query_embedding)) > similarity_threshold
  
  UNION ALL
  
  -- UPI Apps
  SELECT 
    'upi_app'::TEXT AS source,
    ua.id AS item_id,
    ua.name::TEXT AS title,
    (1 - (ua.embedding <=> query_embedding))::FLOAT4 AS similarity
  FROM knowledge_upi_apps ua
  WHERE ua.is_active = true 
    AND ua.embedding IS NOT NULL
    AND (1 - (ua.embedding <=> query_embedding)) > similarity_threshold
  
  UNION ALL
  
  -- Strategies
  SELECT 
    'strategy'::TEXT AS source,
    s.id AS item_id,
    s.title::TEXT AS title,
    (1 - (s.embedding <=> query_embedding))::FLOAT4 AS similarity
  FROM knowledge_strategies s
  WHERE s.is_active = true 
    AND s.embedding IS NOT NULL
    AND (1 - (s.embedding <=> query_embedding)) > similarity_threshold
  
  ORDER BY similarity DESC
  LIMIT match_limit;
END;
$$ LANGUAGE plpgsql STABLE;


-- Search active offers with merchant/category context
-- This injects live offers into AI context
CREATE OR REPLACE FUNCTION search_active_offers(
  merchant_slugs TEXT[] DEFAULT '{}',
  category_slugs TEXT[] DEFAULT '{}',
  app_slugs TEXT[] DEFAULT '{}',
  search_text TEXT DEFAULT '',
  match_limit INT DEFAULT 5
) RETURNS TABLE(
  offer_id UUID,
  merchant_name TEXT,
  app_name TEXT,
  offer_type TEXT,
  title TEXT,
  description TEXT,
  cashback_amount NUMERIC,
  cashback_percent NUMERIC,
  max_cashback NUMERIC,
  min_transaction NUMERIC,
  promo_code TEXT,
  valid_to TIMESTAMPTZ,
  verified_count INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id AS offer_id,
    m.name AS merchant_name,
    pa.name AS app_name,
    o.type AS offer_type,
    o.title,
    o.description,
    o.cashback_amount,
    o.cashback_percent,
    o.max_cashback,
    o.min_transaction,
    o.promo_code,
    o.valid_to,
    o.verified_count::INT
  FROM offers o
  JOIN merchants m ON o.merchant_id = m.id
  JOIN payment_apps pa ON o.payment_app_id = pa.id
  LEFT JOIN categories c ON m.category_id = c.id
  WHERE o.status = 'active'
    AND o.valid_to > NOW()
    AND (
      -- Match by merchant slug
      (array_length(merchant_slugs, 1) > 0 AND m.slug = ANY(merchant_slugs))
      OR
      -- Match by category slug
      (array_length(category_slugs, 1) > 0 AND c.slug = ANY(category_slugs))
      OR
      -- Match by payment app slug
      (array_length(app_slugs, 1) > 0 AND pa.slug = ANY(app_slugs))
      OR
      -- Match by text search on offer title/description
      (search_text != '' AND o.search_vector @@ plainto_tsquery('english', search_text))
      OR
      -- If no filters, return top offers by verified count
      (array_length(merchant_slugs, 1) IS NULL 
       AND array_length(category_slugs, 1) IS NULL 
       AND array_length(app_slugs, 1) IS NULL 
       AND search_text = '')
    )
  ORDER BY 
    -- Prioritize: merchant match > category match > text match > general
    CASE 
      WHEN array_length(merchant_slugs, 1) > 0 AND m.slug = ANY(merchant_slugs) THEN 1
      WHEN array_length(app_slugs, 1) > 0 AND pa.slug = ANY(app_slugs) THEN 2
      WHEN array_length(category_slugs, 1) > 0 AND c.slug = ANY(category_slugs) THEN 3
      ELSE 4
    END,
    o.verified_count DESC
  LIMIT match_limit;
END;
$$ LANGUAGE plpgsql STABLE;


-- ================================================================
-- PART D: GRANTS — PUBLIC can call search functions (read-only)
-- ================================================================
GRANT EXECUTE ON FUNCTION search_knowledge(TEXT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_knowledge_vectors(vector, INT, FLOAT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_active_offers(TEXT[], TEXT[], TEXT[], TEXT, INT) TO anon, authenticated;

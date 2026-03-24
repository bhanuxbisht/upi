-- ═══════════════════════════════════════════════════════════════════════
-- AXIS BANK CREDIT CARDS — REMAINING CARDS PATCH
-- Auditor: Technical CTO
-- Source:  paisabazaar.com ONLY
-- Date:    March 24, 2026
-- ═══════════════════════════════════════════════════════════════════════

BEGIN;

-- Wipe to prevent duplicates if script is run multiple times
DELETE FROM knowledge_credit_cards WHERE id IN (
    'axis-reserve', 'axis-aura', 'axis-vistara'
);

-- ───────────────────────────────────────────────────────────────────────
-- 15. AXIS BANK RESERVE CREDIT CARD
-- Source: paisabazaar.com (verified March 2026)
-- Fee: ₹50,000 | Ultra-Premium | 1.5% Forex
-- ───────────────────────────────────────────────────────────────────────
INSERT INTO knowledge_credit_cards (
    id, bank, name, annual_fee, fee_waiver, joining_fee, network, tier,
    rewards, reward_math, penalties, lounge_access, fuel_surcharge_waiver, best_for, is_active, pros, cons
) VALUES (
    'axis-reserve', 'Axis Bank', 'Axis Bank Reserve Credit Card',
    50000, 'Waived on ₹35,00,000 annual spend', 50000, 'Visa', 'super-premium',
    '[{"type":"points","rate":30,"merchant":"International spends per ₹200 (2X)"},{"type":"points","rate":15,"merchant":"Domestic spends per ₹200"}]'::jsonb,
    '{"type":"points","spend_divisor":200,"default_rate":15,"note":"Ultra-Premium. 15,000 RP welcome bonus. 15 RPs/₹200 on domestic, 30 RPs/₹200 on international. Extensive luxury limits.","categories":[{"keywords":["international","foreign","forex"],"rate":30}],"exclusions":["fuel","emi","wallet","rent","education"]}'::jsonb,
    '{"apr_monthly":3.6,"interest_free_period_days":50,"forex_markup_percent":1.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":5000,"fee":500},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":99999999,"fee":1200}],"note":"1% surcharge on rent/education/wallet loads >10K, max ₹1500"}'::jsonb,
    'Unlimited Domestic & International (with guests)',
    true,
    ARRAY['luxury-travel','hni','golf'],
    true,
    ARRAY['Unlimited global lounge access with guests','Low 1.5% forex markup','Free airport transfers & concierge','Club ITC, Accor Plus, Club Marriott memberships'],
    ARRAY['Astounding ₹50,000 annual fee','Requires ₹35L spend for waiver','Strictly for ultra-HNI individuals']
),

-- ───────────────────────────────────────────────────────────────────────
-- 16. AXIS BANK AURA CREDIT CARD
-- Source: paisabazaar.com (verified March 2026)
-- Fee: ₹749 | Health & Wellness
-- ───────────────────────────────────────────────────────────────────────
(
    'axis-aura', 'Axis Bank', 'Axis Bank Aura Credit Card',
    749, 'No distinct spend-based waiver listed', 749, 'Visa', 'mid',
    '[{"type":"points","rate":10,"merchant":"Insurance per ₹200 (5X, capped)"},{"type":"points","rate":2,"merchant":"All other spends per ₹200"}]'::jsonb,
    '{"type":"points","spend_divisor":200,"default_rate":2,"note":"Healthcare focused. 5X on Insurance (capped at ₹10K spend). Value is in Practo/Fitternity limits, not points.","categories":[{"keywords":["insurance","premium"],"rate":10,"max_monthly_spend_for_rate":10000}],"exclusions":["fuel","emi","wallet","rent","education"]}'::jsonb,
    '{"apr_monthly":3.6,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":5000,"fee":500},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":99999999,"fee":1200}]}'::jsonb,
    'None',
    true,
    ARRAY['health','wellness','insurance'],
    true,
    ARRAY['4 free Practo video consultations monthly','4 free Fitternity video fitness sessions','₹500 off annual health check-up','₹750 Decathlon welcome voucher'],
    ARRAY['Standard 2 RP/₹200 earn rate is terrible','No lounge access','Highly niche card']
),

-- ───────────────────────────────────────────────────────────────────────
-- 17. AXIS BANK VISTARA (BASE)
-- Source: paisabazaar.com (DISCONTINUED DUE TO AIR INDIA MERGER)
-- ───────────────────────────────────────────────────────────────────────
(
    'axis-vistara', 'Axis Bank', 'Axis Bank Vistara Credit Card',
    1500, 'None', 1500, 'Visa', 'mid',
    '[{"type":"miles","rate":2,"merchant":"Spends per ₹200"}]'::jsonb,
    '{"type":"miles","spend_divisor":200,"default_rate":2,"note":"Card is dead due to Air India merger. Historical data preserved.","categories":[],"exclusions":["fuel","emi","wallet","rent","education"]}'::jsonb,
    '{"apr_monthly":3.6,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":5000,"fee":500},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":99999999,"fee":1200}]}'::jsonb,
    '2 Domestic lounge visits/quarter',
    true,
    ARRAY['travel','vistara'],
    false, -- MARKED AS DISABLED due to Air India merger
    ARRAY['Base Vistara economy ticket on activation','2 CV points per ₹200'],
    ARRAY['DISCONTINUED: Axis Bank has stopped accepting applications due to Vistara merging with Air India']
);

COMMIT;

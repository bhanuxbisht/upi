-- ═══════════════════════════════════════════════════════════════════════
-- HDFC BANK — MISSING CARDS PATCH (2 Cards)
-- Auditor: Technical CTO
-- Sources: hdfcbank.com, paisabazaar.com ONLY
-- Date: March 24, 2026
-- Note: HDFC Solitaire is EXCLUDED — marked as possibly discontinued
--       on paisabazaar.com. Will not insert unverifiable data.
-- ═══════════════════════════════════════════════════════════════════════

BEGIN;

-- Safe delete to prevent duplicates on re-run
DELETE FROM knowledge_credit_cards WHERE id IN (
    'hdfc-freedom', 'hdfc-tata-neu-infinity'
);

-- ───────────────────────────────────────────────────────────────────────
-- 1. HDFC BANK FREEDOM CREDIT CARD
-- Source: paisabazaar.com (verified March 2026)
-- Fee: ₹500 | Waiver at ₹50,000 | 10X on 5 partners
-- ───────────────────────────────────────────────────────────────────────
INSERT INTO knowledge_credit_cards (
    id, bank, name, annual_fee, fee_waiver, joining_fee, network, tier,
    rewards, reward_math, penalties, lounge_access, fuel_surcharge_waiver, best_for, is_active, pros, cons
) VALUES (
    'hdfc-freedom', 'HDFC Bank', 'HDFC Bank Freedom Credit Card',
    500, 'Waived on ₹50,000 annual spend', 500, 'Visa', 'entry',
    '[{"type":"points","rate":10,"merchant":"BigBasket, BookMyShow, OYO, Swiggy, Uber (10X CashPoints)"},{"type":"points","rate":1,"merchant":"All other spends per ₹150"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.15,"spend_divisor":150,"default_rate":1,"note":"10X CashPoints on BigBasket/BookMyShow/OYO/Swiggy/Uber. Cap: 2,500 CashPoints/month on 10X tier. 1 CashPoint = ₹0.15. Welcome: 500 CashPoints. UPI earn capped at 500 RPs/month. Cashback redemption min 3,334 CPs (= ₹500). Monthly redemption cap 50,000 points.","categories":[{"keywords":["bigbasket","bookmyshow","oyo","swiggy","uber"],"rate":10,"max_cap_points_monthly":2500}],"exclusions":["fuel","emi","wallet","rent","government","education","gaming","insurance","gold","jewelry","prepaid"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":100,"fee":0},{"min":101,"max":500,"fee":100},{"min":501,"max":1000,"fee":500},{"min":1001,"max":5000,"fee":600},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":900},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}],"note":"From Jul 1, 2025: 1% fee on wallet loads and gaming >₹10K/month. From Sep 2024: no RPs on EMI, fuel, wallet, prepaid, vouchers, 3rd-party education."}'::jsonb,
    'None',
    true,
    ARRAY['food-delivery','entertainment','everyday'],
    true,
    ARRAY['10X on BigBasket/Swiggy/BookMyShow/OYO/Uber','Very low ₹50K fee waiver','500 welcome CashPoints','10% Swiggy Dineout discount','EazyDiner dining privileges'],
    ARRAY['CashPoint value only ₹0.15 — very low','10X capped at 2,500 CPs/month','No lounge access','Heavy exclusion list from Sep 2024']
),

-- ───────────────────────────────────────────────────────────────────────
-- 2. TATA NEU INFINITY HDFC BANK CREDIT CARD
-- Source: paisabazaar.com (verified March 2026)
-- Fee: ₹1,499 | Waiver at ₹3,00,000 | NeuCoins ecosystem
-- ───────────────────────────────────────────────────────────────────────
(
    'hdfc-tata-neu-infinity', 'HDFC Bank', 'Tata Neu Infinity HDFC Bank Credit Card',
    1499, 'Waived on ₹3,00,000 annual spend', 1499, 'RuPay', 'premium',
    '[{"type":"neucoins","rate":5,"merchant":"Tata Neu app & Tata brand partners (non-EMI)"},{"type":"neucoins","rate":1.5,"merchant":"All other spends including UPI (RuPay)"}]'::jsonb,
    '{"type":"neucoins","default_rate":0.015,"note":"1 NeuCoin = ₹1 in Tata ecosystem (BigBasket, Croma, Tata CLiQ, Westside, Titan, Taj Hotels, Air India). Welcome: 1,499 NeuCoins on 1st txn in 30 days (= fee reversal). RuPay for UPI. 1.5% on all non-Tata including merchant EMI.","categories":[{"keywords":["tata neu","bigbasket","croma","tata cliq","westside","titan","tanishq","taj","air india"],"rate":0.05}],"exclusions":["fuel","emi","wallet","rent","cash_advance"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":1.99,"late_fees":[{"min":0,"max":100,"fee":0},{"min":101,"max":500,"fee":100},{"min":501,"max":1000,"fee":500},{"min":1001,"max":5000,"fee":600},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":900},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '8 Domestic + 4 International lounge visits/year',
    true,
    ARRAY['tata-ecosystem','upi','travel','premium'],
    true,
    ARRAY['5% NeuCoins on Tata brands (1 NeuCoin = ₹1)','1.5% on ALL other spends + UPI','Welcome NeuCoins = full fee reversal','8 domestic + 4 international lounges','Low 1.99% forex markup'],
    ARRAY['NeuCoins locked to Tata ecosystem only','₹3L fee waiver threshold','₹1,499 fee is steep']
);

COMMIT;

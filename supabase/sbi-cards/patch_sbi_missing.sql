-- ═══════════════════════════════════════════════════════════════════════
-- SBI CARD — MISSING CARDS PATCH (4 Cards)
-- Auditor: Technical CTO
-- Sources: sbicard.com, paisabazaar.com ONLY
-- Date: March 24, 2026
-- ═══════════════════════════════════════════════════════════════════════

BEGIN;

-- Safe delete to prevent duplicates on re-run
DELETE FROM knowledge_credit_cards WHERE id IN (
    'sbi-phonepe-purple', 'sbi-phonepe-select-black', 'sbi-flipkart', 'sbi-tata-neu-plus'
);

-- ───────────────────────────────────────────────────────────────────────
-- 1. PHONEPE SBI CARD PURPLE
-- Source: sbicard.com, paisabazaar.com (verified March 2026)
-- Fee: ₹499 | Waiver at ₹1,00,000 | 3% PhonePe, 2% digital, 1% base
-- ───────────────────────────────────────────────────────────────────────
INSERT INTO knowledge_credit_cards (
    id, bank, name, annual_fee, fee_waiver, joining_fee, network, tier,
    rewards, reward_math, penalties, lounge_access, fuel_surcharge_waiver, best_for, is_active, pros, cons
) VALUES (
    'sbi-phonepe-purple', 'SBI Card', 'PhonePe SBI Card PURPLE',
    499, 'Waived on ₹1,00,000 annual spend', 499, 'Visa', 'entry',
    '[{"type":"cashback","rate":3,"merchant":"PhonePe & Pincode app"},{"type":"cashback","rate":2,"merchant":"1000+ digital partners (Amazon, Swiggy, Zomato etc)"},{"type":"cashback","rate":1,"merchant":"All other spends including UPI (Scan & Pay)"}]'::jsonb,
    '{"type":"cashback","default_rate":0.01,"note":"1 RP = ₹1 (statement credit or gift voucher). Milestone: ₹3,000 Yatra voucher on ₹3L annual spend. Welcome: ₹500 PhonePe voucher within 45 days.","categories":[{"keywords":["phonepe","pincode"],"rate":0.03,"max_cap_points_monthly":1000},{"keywords":["amazon","swiggy","zomato","flipkart","online","digital"],"rate":0.02,"max_cap_points_monthly":1000}],"exclusions":["fuel","emi","wallet","rent","cash_advance","flexipay"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'None',
    true,
    ARRAY['phonepe','upi','digital-payments'],
    true,
    ARRAY['3% on PhonePe ecosystem (1 RP = ₹1)','2% on 1000+ digital partners','1% on UPI Scan & Pay','₹500 PhonePe welcome voucher','₹3K Yatra milestone on ₹3L spend'],
    ARRAY['Caps: 1,000 pts/month on each accelerated tier','No lounge access','Standard SBI exclusions apply']
),

-- ───────────────────────────────────────────────────────────────────────
-- 2. PHONEPE SBI CARD SELECT BLACK
-- Source: sbicard.com, paisabazaar.com (verified March 2026)
-- Fee: ₹1,499 | Waiver at ₹3,00,000 | 10% PhonePe, 5% online, 1% base
-- ───────────────────────────────────────────────────────────────────────
(
    'sbi-phonepe-select-black', 'SBI Card', 'PhonePe SBI Card SELECT BLACK',
    1499, 'Waived on ₹3,00,000 annual spend', 1499, 'Visa', 'premium',
    '[{"type":"cashback","rate":10,"merchant":"PhonePe & Pincode app"},{"type":"cashback","rate":5,"merchant":"1000+ online brands"},{"type":"cashback","rate":1,"merchant":"All other spends including UPI"},{"type":"cashback","rate":1,"merchant":"Utilities & insurance outside PhonePe (capped 500/month)"}]'::jsonb,
    '{"type":"cashback","default_rate":0.01,"note":"1 RP = ₹1. Welcome: ₹1,500 PhonePe gift voucher after 1st bill payment. Milestone: ₹5,000 travel voucher on ₹5L annual spend. Priority Pass membership included.","categories":[{"keywords":["phonepe","pincode"],"rate":0.10,"max_cap_points_monthly":2000},{"keywords":["online","amazon","swiggy","zomato","flipkart","myntra"],"rate":0.05,"max_cap_points_monthly":2000},{"keywords":["utility","insurance"],"rate":0.01,"max_cap_points_monthly":500}],"exclusions":["fuel","emi","wallet","rent","cash_advance","flexipay"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '4 Domestic lounge visits/year (1/quarter) + Priority Pass membership',
    true,
    ARRAY['phonepe','premium','travel','upi'],
    true,
    ARRAY['Massive 10% on PhonePe (1 RP = ₹1)','5% on 1000+ online brands','₹1,500 welcome voucher','4 domestic lounges + Priority Pass','₹5K travel voucher milestone'],
    ARRAY['2,000 pts/month cap on each tier','₹1,499 fee is high','₹3L waiver threshold']
),

-- ───────────────────────────────────────────────────────────────────────
-- 3. FLIPKART SBI CREDIT CARD
-- Source: paisabazaar.com (verified March 2026)
-- Fee: ₹500 | Waiver at ₹3,50,000 | 7.5% Myntra, 5% Flipkart
-- ───────────────────────────────────────────────────────────────────────
(
    'sbi-flipkart', 'SBI Card', 'Flipkart SBI Credit Card',
    500, 'Waived on ₹3,50,000 annual spend', 500, 'Visa', 'mid',
    '[{"type":"cashback","rate":7.5,"merchant":"Myntra"},{"type":"cashback","rate":5,"merchant":"Flipkart, Cleartrip"},{"type":"cashback","rate":4,"merchant":"Preferred partners (Netmeds, Zomato etc)"},{"type":"cashback","rate":1,"merchant":"All other spends"}]'::jsonb,
    '{"type":"cashback","default_rate":0.01,"note":"Cashback auto-credited within 2 days of next statement. Welcome: ₹250 Flipkart Gift Card + ₹1,000 on 1st Flipkart txn in 30 days. Cleartrip: 7% off domestic flights (max ₹1,500), 20% off hotels (max ₹5,000).","categories":[{"keywords":["myntra"],"rate":0.075,"max_cap_amount_quarterly":4000},{"keywords":["flipkart","cleartrip"],"rate":0.05,"max_cap_amount_quarterly":4000},{"keywords":["netmeds","zomato","preferred"],"rate":0.04,"max_cap_amount_quarterly":4000}],"exclusions":["fuel","emi","wallet","rent","cash_advance","flexipay"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'None',
    true,
    ARRAY['flipkart','myntra','online-shopping'],
    true,
    ARRAY['7.5% cashback on Myntra','5% on Flipkart/Cleartrip','4% on preferred partners','1% unlimited base','₹250 Flipkart welcome voucher'],
    ARRAY['All accelerated tiers capped at ₹4K/quarter each','₹3.5L fee waiver threshold is extremely high','No lounge access']
),

-- ───────────────────────────────────────────────────────────────────────
-- 4. TATA NEU PLUS SBI CREDIT CARD
-- Source: paisabazaar.com (verified March 2026)
-- Fee: ₹499 | Waiver at ₹1,00,000 | NeuCoins ecosystem
-- ───────────────────────────────────────────────────────────────────────
(
    'sbi-tata-neu-plus', 'SBI Card', 'Tata Neu Plus SBI Credit Card',
    499, 'Waived on ₹1,00,000 annual spend', 499, 'RuPay', 'mid',
    '[{"type":"neucoins","rate":7,"merchant":"Up to 7% on Tata Neu app (2% Tata brands + 5% select category)"},{"type":"neucoins","rate":1,"merchant":"All other spends including UPI (RuPay)"}]'::jsonb,
    '{"type":"neucoins","default_rate":0.01,"note":"1 NeuCoin = ₹1 redeemable within Tata ecosystem (BigBasket, Croma, Tata CLiQ, Westside, Titan, Tanishq, Taj Hotels). Welcome: 499 NeuCoins on fee payment. RuPay variant supports UPI.","categories":[{"keywords":["tata neu","bigbasket","croma","tata cliq","westside","titan","tanishq"],"rate":0.02},{"keywords":["select category"],"rate":0.05,"note":"Extra 5% on select categories via Tata Neu app"}],"exclusions":["fuel","emi","wallet","rent","cash_advance","flexipay"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '4 Domestic lounge visits/year',
    true,
    ARRAY['tata-ecosystem','upi','everyday-spending'],
    true,
    ARRAY['Up to 7% NeuCoins on Tata ecosystem','1 NeuCoin = ₹1 (true value)','1% on UPI (RuPay)','Welcome NeuCoins = fee reversal','4 domestic lounges'],
    ARRAY['NeuCoins only redeemable within Tata ecosystem','Standard SBI exclusions','₹1L waiver is reasonable']
);

COMMIT;

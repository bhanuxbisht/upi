-- ═══════════════════════════════════════════════════════════════════════
-- HDFC BANK — REMAINING CARDS PATCH
-- Sources: hdfcbank.com, paisabazaar.com ONLY (per STRICT_RESEARCH_RULES.md)
-- Date: March 24, 2026
-- ═══════════════════════════════════════════════════════════════════════

BEGIN;

-- ───────────────────────────────────────────────────────────────────────
-- 24. HDFC DINERS CLUB PRIVILEGE
-- Source: paisabazaar.com, hdfcbank.com
-- Fee: ₹2,500 | Waiver at ₹3,00,000 | 2% forex | 4 RP/₹150 base
-- ───────────────────────────────────────────────────────────────────────
DELETE FROM knowledge_credit_cards WHERE id IN ('hdfc-diners-privilege', 'hdfc-paytm', 'hdfc-paytm-select', 'hdfc-bharat', 'hdfc-6e-rewards', 'hdfc-6e-rewards-xl');

INSERT INTO knowledge_credit_cards (
    id, bank, name, annual_fee, fee_waiver, joining_fee, network, tier,
    rewards, reward_math, penalties, lounge_access, fuel_surcharge_waiver, best_for, is_active, pros, cons
) VALUES (
    'hdfc-diners-privilege', 'HDFC Bank', 'Diners Club Privilege Credit Card',
    2500, 'Waived on ₹3,00,000 annual spend', 2500, 'Diners', 'premium',
    '[{"type":"points","rate":4,"merchant":"All retail per ₹150"},{"type":"points","rate":20,"merchant":"Swiggy, Zomato (5X)"},{"type":"points","rate":40,"merchant":"SmartBuy (10X)"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.50,"spend_divisor":150,"default_rate":4,"categories":[{"keywords":["swiggy","zomato"],"rate":20,"max_cap_points_monthly":2500},{"keywords":["smartbuy","hotel","flight"],"rate":40,"max_cap_points_monthly":5000}],"exclusions":["fuel","wallet","rent","insurance"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":2.0,"late_fees":[{"min":0,"max":100,"fee":0},{"min":101,"max":500,"fee":100},{"min":501,"max":1000,"fee":500},{"min":1001,"max":5000,"fee":600},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":900},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '8 Domestic lounge visits/year (2/quarter, requires ₹15K spend in previous quarter)',
    true,
    ARRAY['dining','lifestyle','movies'],
    true,
    ARRAY['5X on Swiggy/Zomato','10X on SmartBuy','Buy 1 Get 1 Free on BookMyShow weekends','Low 2% forex markup','Complimentary Swiggy One + Times Prime on ₹75K spend in first 90 days'],
    ARRAY['Diners Club acceptance limited in India','1 RP = only ₹0.50 (not ₹1.0 like Black/Infinia)','Lounge access requires ₹15K quarterly spend']
),

-- ───────────────────────────────────────────────────────────────────────
-- 25. HDFC PAYTM CREDIT CARD (Base)
-- Source: paisabazaar.com
-- Fee: ₹500 | Waiver at ₹50,000 | CashPoints
-- ───────────────────────────────────────────────────────────────────────
(
    'hdfc-paytm', 'HDFC Bank', 'Paytm HDFC Credit Card',
    500, 'Waived on ₹50,000 annual spend (joining fee waived on ₹30K in 90 days)', 500, 'Visa', 'entry',
    '[{"type":"cashpoints","rate":3,"merchant":"Paytm Recharge, Utility, Movies, Mini App"},{"type":"cashpoints","rate":2,"merchant":"Other Paytm spends"},{"type":"cashpoints","rate":1,"merchant":"All other retail"}]'::jsonb,
    '{"type":"cashback","default_rate":0.01,"categories":[{"keywords":["paytm","recharge","utility","movies","mini app"],"rate":0.03,"max_cap_points_monthly":500},{"keywords":["paytm"],"rate":0.02,"max_cap_points_monthly":500}],"exclusions":["fuel","wallet","rent","government","education","emi"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":100,"fee":0},{"min":101,"max":500,"fee":100},{"min":501,"max":1000,"fee":500},{"min":1001,"max":5000,"fee":600},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":900},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'None',
    true,
    ARRAY['paytm','bills','recharge'],
    true,
    ARRAY['3% on Paytm bill payments and recharges','Low ₹500 fee','₹50K fee waiver'],
    ARRAY['1 CashPoint = only ₹0.25','Overall 3,000 pts/month redemption cap','Paytm First membership discontinued']
),

-- ───────────────────────────────────────────────────────────────────────
-- 26. PAYTM HDFC BANK SELECT CREDIT CARD
-- Source: paisabazaar.com
-- Fee: ₹1,000 | Joining waiver on ₹50K in 90 days | Renewal at ₹1.5L
-- ───────────────────────────────────────────────────────────────────────
(
    'hdfc-paytm-select', 'HDFC Bank', 'Paytm HDFC Bank Select Credit Card',
    1000, 'Waived on ₹1,50,000 annual spend (joining fee waived on ₹50K in 90 days)', 1000, 'Visa', 'mid',
    '[{"type":"cashback","rate":5,"merchant":"All Paytm purchases"},{"type":"cashback","rate":1,"merchant":"All other spends"}]'::jsonb,
    '{"type":"cashback","default_rate":0.01,"categories":[{"keywords":["paytm"],"rate":0.05}],"exclusions":["fuel","wallet","rent","emi","education"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":100,"fee":0},{"min":101,"max":500,"fee":100},{"min":501,"max":1000,"fee":500},{"min":1001,"max":5000,"fee":600},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":900},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'None',
    true,
    ARRAY['paytm','online-shopping'],
    true,
    ARRAY['5% cashback on ALL Paytm purchases','₹500 vouchers on ₹50K quarterly spend','20% off Dineout restaurants'],
    ARRAY['Grocery cashback capped at 1,000 pts/month','No lounge access','Cashback on rentals/education excluded']
),

-- ───────────────────────────────────────────────────────────────────────
-- 27. HDFC BHARAT CREDIT CARD
-- Source: paisabazaar.com, hdfcbank.com
-- Fee: ₹500 | Waiver at ₹50,000 | 5% on fuel/grocery/IRCTC/bills
-- ───────────────────────────────────────────────────────────────────────
(
    'hdfc-bharat', 'HDFC Bank', 'HDFC Bharat Credit Card',
    500, 'Waived on ₹50,000 annual spend', 500, 'RuPay', 'entry',
    '[{"type":"points","rate":5,"merchant":"IRCTC, Fuel, Grocery, Bills, Recharges, EasyEMI, SmartBuy, PayZapp"},{"type":"points","rate":1,"merchant":"All other spends per ₹100"}]'::jsonb,
    '{"type":"points","point_value_rupees":1.0,"spend_divisor":100,"default_rate":1,"categories":[{"keywords":["irctc","fuel","petrol","diesel","grocery","bills","recharge","easyemi","smartbuy","payzapp"],"rate":5,"max_cap_points_monthly":150}],"exclusions":["wallet","rent","emi"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":100,"fee":0},{"min":101,"max":500,"fee":100},{"min":501,"max":1000,"fee":500},{"min":1001,"max":5000,"fee":600},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":900},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'None',
    true,
    ARRAY['fuel','grocery','rural','entry-level'],
    true,
    ARRAY['5% on fuel, grocery, IRCTC, bills, SmartBuy, PayZapp','1 RP = ₹1','RuPay — UPI enabled','Low ₹500 fee, ₹50K waiver','1% fuel surcharge waiver'],
    ARRAY['5% category cap at 150 pts/month (very low)','No lounge access','Very basic card']
),

-- ───────────────────────────────────────────────────────────────────────
-- 28. 6E REWARDS INDIGO CREDIT CARD (DISCONTINUED)
-- Source: hdfcbank.com (confirmed discontinued, existing holders being migrated)
-- ───────────────────────────────────────────────────────────────────────
(
    'hdfc-6e-rewards', 'HDFC Bank', '6E Rewards IndiGo Credit Card',
    500, 'None', 500, 'Visa', 'entry',
    '[{"type":"6e_rewards","rate":2.5,"merchant":"IndiGo flights per ₹100"},{"type":"6e_rewards","rate":2,"merchant":"Dining, Grocery, Entertainment per ₹100"},{"type":"6e_rewards","rate":1,"merchant":"All other per ₹100"}]'::jsonb,
    '{"type":"points","point_value_rupees":1.0,"spend_divisor":100,"default_rate":1,"categories":[{"keywords":["indigo","goindigo","6e"],"rate":2.5},{"keywords":["dining","grocery","entertainment"],"rate":2}],"exclusions":["fuel","wallet"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":100,"fee":0},{"min":101,"max":500,"fee":100},{"min":501,"max":1000,"fee":500},{"min":1001,"max":5000,"fee":600},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":900},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'None',
    true,
    ARRAY['indigo','travel'],
    false,
    ARRAY['2.5% on IndiGo flights','1 6E Reward = ₹1','Welcome flight voucher ₹1,500'],
    ARRAY['DISCONTINUED — new applications closed, existing holders being migrated','6E Rewards redeemable ONLY on IndiGo','₹200 redemption fee per person']
),

-- ───────────────────────────────────────────────────────────────────────
-- 29. 6E REWARDS XL INDIGO CREDIT CARD (DISCONTINUED)
-- Source: hdfcbank.com, paisabazaar.com
-- ───────────────────────────────────────────────────────────────────────
(
    'hdfc-6e-rewards-xl', 'HDFC Bank', '6E Rewards XL IndiGo Credit Card',
    1500, 'None', 1500, 'Visa', 'mid',
    '[{"type":"6e_rewards","rate":5,"merchant":"IndiGo flights per ₹100"},{"type":"6e_rewards","rate":3,"merchant":"Dining, Grocery, Entertainment per ₹100"},{"type":"6e_rewards","rate":2,"merchant":"All other per ₹100"}]'::jsonb,
    '{"type":"points","point_value_rupees":1.0,"spend_divisor":100,"default_rate":2,"categories":[{"keywords":["indigo","goindigo","6e"],"rate":5},{"keywords":["dining","grocery","entertainment"],"rate":3}],"exclusions":["fuel","wallet"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":2.5,"late_fees":[{"min":0,"max":100,"fee":0},{"min":101,"max":500,"fee":100},{"min":501,"max":1000,"fee":500},{"min":1001,"max":5000,"fee":600},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":900},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '8 Domestic lounge visits/year (2/quarter)',
    true,
    ARRAY['indigo','travel'],
    false,
    ARRAY['5% on IndiGo flights','Low 2.5% forex','8 domestic lounge visits','Welcome flight voucher ₹3,000'],
    ARRAY['DISCONTINUED — new applications closed, existing holders being migrated','6E Rewards redeemable ONLY on IndiGo']
);

COMMIT;

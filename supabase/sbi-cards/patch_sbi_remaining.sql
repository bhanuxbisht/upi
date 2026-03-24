-- ═══════════════════════════════════════════════════════════════════════
-- SBI CARD — REMAINING CARDS PATCH
-- Sources: sbicard.com, paisabazaar.com ONLY (per STRICT_RESEARCH_RULES.md)
-- Date: March 24, 2026
-- ═══════════════════════════════════════════════════════════════════════

BEGIN;

-- ───────────────────────────────────────────────────────────────────────
-- 28. SBI CARD UNNATI (Secured Card against FD)
-- Source: paisabazaar.com, sbicard.com
-- Fee: ₹0 for first 4 years | ₹499 from 5th year | Secured against ₹25K+ FD
-- ───────────────────────────────────────────────────────────────────────
DELETE FROM knowledge_credit_cards WHERE id IN ('sbi-unnati', 'sbi-shaurya', 'sbi-shaurya-select', 'sbi-airindia-plat', 'sbi-airindia-sig', 'sbi-yatra', 'sbi-ola-money', 'sbi-paytm', 'sbi-paytm-select');

INSERT INTO knowledge_credit_cards (
    id, bank, name, annual_fee, fee_waiver, joining_fee, network, tier,
    rewards, reward_math, penalties, lounge_access, fuel_surcharge_waiver, best_for, is_active, pros, cons
) VALUES (
    'sbi-unnati', 'SBI Card', 'SBI Card Unnati',
    0, 'Free for first 4 years; ₹499 from 5th year; no spend-based waiver', 0, 'Visa', 'entry',
    '[{"type":"points","rate":1,"merchant":"All retail spends per ₹100"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.25,"spend_divisor":100,"default_rate":1,"note":"Secured card issued against FD of ₹25,000+. ₹500 cashback milestone on ₹50,000 annual spend. Credit limit = 80% of FD value.","categories":[],"exclusions":["fuel","wallet","cash_advance"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'None',
    true,
    ARRAY['credit-building','secured','beginners'],
    true,
    ARRAY['₹0 fee for first 4 years','Secured against FD — easy approval','₹500 cashback on ₹50K annual spend','1% fuel surcharge waiver','Good for building credit history'],
    ARRAY['Only 1 RP per ₹100 (0.25% effective)','No lounge access','₹499 fee kicks in from 5th year']
),

-- ───────────────────────────────────────────────────────────────────────
-- 29. SHAURYA SBI CARD (Armed Forces)
-- Source: paisabazaar.com, sbicard.com
-- Fee: ₹250 | Waiver at ₹50,000 | Exclusively for Defence
-- ───────────────────────────────────────────────────────────────────────
(
    'sbi-shaurya', 'SBI Card', 'Shaurya SBI Card',
    250, 'Waived on ₹50,000 annual spend', 250, 'Visa', 'entry',
    '[{"type":"points","rate":5,"merchant":"CSD, Dining, Movies, Grocery, Departmental Stores"},{"type":"points","rate":1,"merchant":"All other spends per ₹100"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.25,"spend_divisor":100,"default_rate":1,"note":"Exclusively for Indian Armed Forces (Army, Navy, Air Force, Paramilitary). Card embossed with service branch insignia. Welcome benefit: 1,000 RPs on first-year fee payment.","categories":[{"keywords":["csd","canteen","dining","movie","grocery","departmental","supermarket"],"rate":5}],"exclusions":["fuel","cash_advance","wallet"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'None',
    true,
    ARRAY['defense','armed-forces','csd'],
    true,
    ARRAY['Very low ₹250 fee','5X on CSD/dining/grocery/movies','Service branch insignia on card','1,000 RP welcome bonus','Personal accident insurance ₹2L','1% fuel surcharge waiver'],
    ARRAY['Exclusively for Armed Forces — civilians cannot apply','Low base earn (0.25% effective)','No lounge access']
),

-- ───────────────────────────────────────────────────────────────────────
-- 30. SHAURYA SELECT SBI CARD (Premium Armed Forces)
-- Source: paisabazaar.com, sbicard.com
-- Fee: ₹1,499 | Waiver at ₹2,00,000
-- ───────────────────────────────────────────────────────────────────────
(
    'sbi-shaurya-select', 'SBI Card', 'Shaurya Select SBI Card',
    1499, 'Waived on ₹2,00,000 annual spend', 1499, 'Visa', 'mid',
    '[{"type":"points","rate":10,"merchant":"CSD, Dining, Movies, Grocery, Departmental Stores"},{"type":"points","rate":2,"merchant":"All other spends per ₹100"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.25,"spend_divisor":100,"default_rate":2,"note":"Premium variant for Armed Forces. 10X on CSD and lifestyle categories.","categories":[{"keywords":["csd","canteen","dining","movie","grocery","departmental","supermarket"],"rate":10}],"exclusions":["fuel","cash_advance","wallet"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '4 Domestic lounge visits/year',
    true,
    ARRAY['defense','armed-forces','csd'],
    true,
    ARRAY['10X on CSD/dining/grocery/movies (2.5% effective)','4 domestic lounge visits','Service branch insignia'],
    ARRAY['Exclusively for Armed Forces','₹2L waiver threshold']
),

-- ───────────────────────────────────────────────────────────────────────
-- 31. AIR INDIA SBI PLATINUM CARD
-- Source: paisabazaar.com, sbicard.com
-- Fee: ₹1,499 | Waiver at ₹3,00,000
-- ───────────────────────────────────────────────────────────────────────
(
    'sbi-airindia-plat', 'SBI Card', 'Air India SBI Platinum Card',
    1499, 'Waived on ₹3,00,000 annual spend', 1499, 'Visa', 'mid',
    '[{"type":"points","rate":4,"merchant":"Air India bookings per ₹100"},{"type":"points","rate":2,"merchant":"Dining, Entertainment per ₹100"},{"type":"points","rate":1,"merchant":"All other spends per ₹100"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.25,"spend_divisor":100,"default_rate":1,"note":"Points convertible 1:1 to Air India Maharaja Points. 5,000 bonus RPs on ₹1L annual spend, 15,000 bonus on ₹2L, 30,000 bonus on ₹4L.","categories":[{"keywords":["air india","airindia","maharaja"],"rate":4},{"keywords":["dining","entertainment","restaurant"],"rate":2}],"exclusions":["fuel","wallet","rent","emi"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '4 Domestic lounge visits/year (2/quarter)',
    true,
    ARRAY['air-india','travel'],
    true,
    ARRAY['4 RPs per ₹100 on Air India (1:1 Maharaja Point conversion)','Up to 30,000 bonus RPs on annual spend milestones','4 domestic lounges'],
    ARRAY['Points value only ₹0.25 unless converted to Maharaja Points','₹3L fee waiver is high']
),

-- ───────────────────────────────────────────────────────────────────────
-- 32. AIR INDIA SBI SIGNATURE CARD
-- Source: paisabazaar.com, sbicard.com
-- Fee: ₹4,999 | Waiver at ₹10,00,000
-- ───────────────────────────────────────────────────────────────────────
(
    'sbi-airindia-sig', 'SBI Card', 'Air India SBI Signature Card',
    4999, 'Waived on ₹10,00,000 annual spend', 4999, 'Visa', 'super-premium',
    '[{"type":"points","rate":10,"merchant":"Air India bookings per ₹100"},{"type":"points","rate":4,"merchant":"All other spends per ₹100"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.25,"spend_divisor":100,"default_rate":4,"note":"20,000 RP welcome gift. Points convertible 1:1 to Air India Maharaja Points. Up to 100,000 bonus RPs annually on retail spend milestones. Complimentary Flying Returns membership.","categories":[{"keywords":["air india","airindia","maharaja"],"rate":10}],"milestones":[{"spend":200000,"bonus_points":20000},{"spend":400000,"bonus_points":25000},{"spend":600000,"bonus_points":25000},{"spend":800000,"bonus_points":30000}],"exclusions":["fuel","wallet","rent","emi"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '8 Domestic (2/quarter) + Priority Pass International lounge visits/year',
    true,
    ARRAY['air-india','travel','premium'],
    true,
    ARRAY['10 RPs per ₹100 on Air India','20,000 RP welcome gift','Up to 100,000 bonus RPs/year','Priority Pass international lounges','Complimentary Flying Returns membership'],
    ARRAY['Extreme ₹10L fee waiver','₹4,999 fee','Points only ₹0.25 unless used as Maharaja Points']
),

-- ───────────────────────────────────────────────────────────────────────
-- 33. YATRA SBI CARD
-- Source: paisabazaar.com, yatra.com
-- Fee: ₹499 | Waiver at ₹1,00,000
-- ───────────────────────────────────────────────────────────────────────
(
    'sbi-yatra', 'SBI Card', 'Yatra SBI Card',
    499, 'Waived on ₹1,00,000 annual spend', 499, 'Visa', 'entry',
    '[{"type":"points","rate":6,"merchant":"Dining, Grocery, Movies, Entertainment, Departmental, International per ₹100"},{"type":"points","rate":1,"merchant":"All other spends per ₹100"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.25,"spend_divisor":100,"default_rate":1,"note":"Welcome vouchers worth ₹8,250 on Yatra.com (flights + hotels). ₹1,000 off domestic flights over ₹5,000. ₹4,000 off international flights over ₹40,000. 20% off domestic hotels. Points redeemable for Yatra.com discount vouchers.","categories":[{"keywords":["dining","grocery","movie","entertainment","departmental","international"],"rate":6}],"exclusions":["fuel","wallet","cash_advance"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'None',
    true,
    ARRAY['travel','yatra'],
    true,
    ARRAY['₹8,250 welcome vouchers on Yatra.com','6X on dining/grocery/movies/international (1.5% effective)','₹1K off domestic flights, ₹4K off international flights'],
    ARRAY['Points redeemable only for Yatra.com vouchers','No lounge access','1 RP = ₹0.25']
),

-- ───────────────────────────────────────────────────────────────────────
-- 34. OLA MONEY SBI CREDIT CARD
-- Source: paisabazaar.com, sbicard.com
-- Fee: ₹0 joining; ₹499 from 2nd year | Waiver at ₹1,00,000
-- ───────────────────────────────────────────────────────────────────────
(
    'sbi-ola-money', 'SBI Card', 'Ola Money SBI Credit Card',
    499, 'Waived on ₹1,00,000 annual spend (₹0 joining fee)', 0, 'Visa', 'entry',
    '[{"type":"points","rate":7,"merchant":"Ola rides and Ola Postpaid spends"},{"type":"points","rate":1,"merchant":"All other spends per ₹100"}]'::jsonb,
    '{"type":"cashback","default_rate":0.01,"note":"7% wallet cashback on Ola spends. Credited to Ola Money wallet — redeemable only against future Ola ride bookings.","categories":[{"keywords":["ola","ola postpaid","ola ride"],"rate":0.07}],"exclusions":["fuel","wallet","cash_advance"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'None',
    true,
    ARRAY['ola','ride-hailing'],
    true,
    ARRAY['₹0 joining fee','7% on Ola rides','1% fuel surcharge waiver'],
    ARRAY['Points locked to Ola Money wallet — only for rides','₹499 from 2nd year','No lounge access','1 RP = only ₹0.25 on non-Ola']
),

-- ───────────────────────────────────────────────────────────────────────
-- 35. PAYTM SBI CARD
-- Source: paisabazaar.com, sbicard.com
-- Fee: ₹500 joining; ₹499 renewal | No spend-based renewal waiver
-- Note: From Jul 2024, cashback replaced with reward points of equivalent value
-- ───────────────────────────────────────────────────────────────────────
(
    'sbi-paytm', 'SBI Card', 'Paytm SBI Card',
    499, 'No spend-based fee waiver (Gets Paytm First Membership voucher on ₹1,00,000 spend)', 500, 'Visa', 'entry',
    '[{"type":"points","rate":3,"merchant":"Paytm Mall, Movies, Travel via Paytm App"},{"type":"points","rate":2,"merchant":"Other Paytm App purchases"},{"type":"points","rate":1,"merchant":"All other spends"}]'::jsonb,
    '{"type":"cashback","default_rate":0.01,"note":"From Jul 1, 2024: points equivalent to 3% value on Paytm Mall/Movies/Travel, 2% on other Paytm, 1% on everything else. Complimentary cyber fraud insurance cover.","categories":[{"keywords":["paytm mall","paytm movies","paytm travel"],"rate":0.03},{"keywords":["paytm"],"rate":0.02}],"exclusions":["fuel","wallet","rent","education"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'None',
    true,
    ARRAY['paytm','online-shopping'],
    true,
    ARRAY['3% on Paytm Mall/Movies/Travel','Cyber fraud insurance','1% fuel surcharge waiver'],
    ARRAY['Cashback replaced with reward points from Jul 2024','No spend-based fee waiver','No lounge access']
),

-- ───────────────────────────────────────────────────────────────────────
-- 36. PAYTM SBI CARD SELECT
-- Source: paisabazaar.com, sbicard.com
-- Fee: ₹1,499 | Waiver at ₹2,00,000
-- ───────────────────────────────────────────────────────────────────────
(
    'sbi-paytm-select', 'SBI Card', 'Paytm SBI Card SELECT',
    1499, 'Waived on ₹2,00,000 annual spend', 1499, 'Visa', 'mid',
    '[{"type":"points","rate":5,"merchant":"Paytm Mall, Movies, Travel via Paytm App"},{"type":"points","rate":3,"merchant":"Other Paytm App purchases"},{"type":"points","rate":1,"merchant":"All other spends"}]'::jsonb,
    '{"type":"cashback","default_rate":0.01,"note":"Premium variant of Paytm SBI. From Jul 1, 2024: points equivalent to 5% value on Paytm Mall/Movies/Travel, 3% on other Paytm, 1% on everything else.","categories":[{"keywords":["paytm mall","paytm movies","paytm travel"],"rate":0.05},{"keywords":["paytm"],"rate":0.03}],"exclusions":["fuel","wallet","rent","education"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '4 Domestic lounge visits/year',
    true,
    ARRAY['paytm','online-shopping'],
    true,
    ARRAY['5% on Paytm Mall/Movies/Travel','4 domestic lounge visits','Cyber fraud insurance'],
    ARRAY['Cashback replaced with reward points from Jul 2024','1 RP = ₹0.25','₹2L fee waiver threshold is high']
);

COMMIT;

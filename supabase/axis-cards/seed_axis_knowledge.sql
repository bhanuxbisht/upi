-- ═══════════════════════════════════════════════════════════════════════
-- AXIS BANK CREDIT CARDS — COMPLETE MASTER SEED (2026 Verified)
-- Auditor: Technical CTO
-- Sources: axisbank.com, paisabazaar.com ONLY (per STRICT_RESEARCH_RULES.md)
-- Date: March 24, 2026
-- ═══════════════════════════════════════════════════════════════════════

BEGIN;

-- Wipe existing Axis Bank data to prevent overlaps/false logic
DELETE FROM knowledge_credit_cards WHERE bank = 'Axis Bank';

-- ───────────────────────────────────────────────────────────────────────
-- 1. AXIS BANK ACE CREDIT CARD
-- Source: paisabazaar.com (verified March 2026)
-- Fee: ₹499 | Waiver at ₹2,00,000 | 5% Utility, 4% Food, 1.5% base
-- ───────────────────────────────────────────────────────────────────────
INSERT INTO knowledge_credit_cards (
    id, bank, name, annual_fee, fee_waiver, joining_fee, network, tier,
    rewards, reward_math, penalties, lounge_access, fuel_surcharge_waiver, best_for, is_active, pros, cons
) VALUES (
    'axis-ace', 'Axis Bank', 'Axis Bank ACE Credit Card',
    499, 'Waived on ₹2,00,000 annual spend', 499, 'Visa', 'entry',
    '[{"type":"cashback","rate":5,"merchant":"Utility Bill Payments"},{"type":"cashback","rate":4,"merchant":"Swiggy, Zomato, Ola"},{"type":"cashback","rate":1.5,"merchant":"All other spends"}]'::jsonb,
    '{"type":"cashback","default_rate":0.015,"categories":[{"keywords":["utility","electricity","water","gas","bill"],"rate":0.05,"max_cap_amount_monthly":500,"note":"5% and 4% categories share a combined ₹500/month cap"},{"keywords":["swiggy","zomato","ola"],"rate":0.04,"max_cap_amount_monthly":500}],"exclusions":["fuel","emi","wallet","rent","education"]}'::jsonb,
    '{"apr_monthly":3.6,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":5000,"fee":500},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":99999999,"fee":1200}],"note":"1% surcharge on rent/education/wallet loads >10K, max ₹1500"}'::jsonb,
    '4 Domestic lounge visits/year (requires ₹50K spend in previous 3 months)',
    true,
    ARRAY['utility-bills','food-delivery','cashback'],
    true,
    ARRAY['High 1.5% unlimited base cashback','5% on utility bills','4% on Swiggy/Zomato/Ola','4 domestic lounge visits'],
    ARRAY['Strict ₹500 combined monthly cap on 5%+4% categories','High ₹2L fee waiver','Lounge needs ₹50K prev quarter spend']
),

-- ───────────────────────────────────────────────────────────────────────
-- 2. FLIPKART AXIS BANK CREDIT CARD
-- Source: paisabazaar.com (verified March 2026)
-- Fee: ₹500 | Waiver at ₹3,50,000 | 5% Flipkart, 4% partners
-- ───────────────────────────────────────────────────────────────────────
(
    'axis-flipkart', 'Axis Bank', 'Flipkart Axis Bank Credit Card',
    500, 'Waived on ₹3,50,000 annual spend', 500, 'Visa', 'entry',
    '[{"type":"cashback","rate":5,"merchant":"Flipkart, Cleartrip"},{"type":"cashback","rate":4,"merchant":"Swiggy, Uber, PVR, Cult.fit"},{"type":"cashback","rate":1,"merchant":"All other spends"}]'::jsonb,
    '{"type":"cashback","default_rate":0.01,"categories":[{"keywords":["flipkart","cleartrip"],"rate":0.05},{"keywords":["swiggy","uber","pvr","cult.fit"],"rate":0.04}],"exclusions":["fuel","emi","wallet","rent","education","jewelry"]}'::jsonb,
    '{"apr_monthly":3.6,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":5000,"fee":500},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":99999999,"fee":1200}],"note":"1% surcharge on rent/education/wallet loads >10K, max ₹1500"}'::jsonb,
    '4 Domestic lounge visits/year',
    true,
    ARRAY['online-shopping','flipkart'],
    true,
    ARRAY['5% on Flipkart/Cleartrip','4% on Swiggy/Uber/PVR','₹500 Flipkart welcome voucher','4 domestic lounge visits'],
    ARRAY['Fee waiver hiked to ₹3.5L','1% base cashback is low','1% fee on rent/education limits usage']
),

-- ───────────────────────────────────────────────────────────────────────
-- 3. AIRTEL AXIS BANK CREDIT CARD
-- Source: paisabazaar.com (April 12, 2026 changes verified)
-- Fee: ₹500 | Waiver at ₹2,00,000 | 25% Airtel (dynamic cap)
-- ───────────────────────────────────────────────────────────────────────
(
    'axis-airtel', 'Axis Bank', 'Airtel Axis Bank Credit Card',
    500, 'Waived on ₹2,00,000 annual spend', 500, 'Visa', 'mid',
    '[{"type":"cashback","rate":25,"merchant":"Airtel Mobile/Broadband/DTH via Thanks app"},{"type":"cashback","rate":10,"merchant":"Utility bills via Thanks app"},{"type":"value_back","rate":10,"merchant":"Blinkit, Zomato, District Movies (post-April 2026, credited to partner wallet)"},{"type":"cashback","rate":1,"merchant":"All other spends"}]'::jsonb,
    '{"type":"cashback","default_rate":0.01,"note":"CRITICAL April 12, 2026 UPDATE: 25% Airtel cashback cap linked to 2X base cashback earned. 10% utility cap linked to 1X base. 10% on Zomato/Blinkit paid to partner wallet, NOT statement credit.","categories":[{"keywords":["airtel","dth","broadband","thanks app"],"rate":0.25,"dynamic_cap":"2X Base Cashback"},{"keywords":["utility","electricity"],"rate":0.10,"dynamic_cap":"1X Base Cashback"},{"keywords":["zomato","blinkit","district"],"rate":0.10,"note":"Credited to partner wallet, not statement"}],"exclusions":["fuel","emi","wallet","rent","education"]}'::jsonb,
    '{"apr_monthly":3.6,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":5000,"fee":500},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":99999999,"fee":1200}],"note":"1% surcharge on rent/education/wallet loads >10K, max ₹1500"}'::jsonb,
    'None (Lounge access DISCONTINUED April 12, 2026)',
    true,
    ARRAY['airtel','utility-bills'],
    true,
    ARRAY['25% cashback on Airtel ecosystem','10% on utility bills','1% base cashback','₹500 Amazon welcome voucher'],
    ARRAY['Post-April 2026 dynamic caps are extremely restrictive','Lounge access REMOVED in 2026','Zomato/Blinkit trapped in partner wallets']
),

-- ───────────────────────────────────────────────────────────────────────
-- 4. AXIS BANK CASHBACK CREDIT CARD
-- Source: paisabazaar.com (verified March 2026)
-- Fee: ₹1,000 | Waiver at ₹4,00,000 | Tiered online cashback
-- ───────────────────────────────────────────────────────────────────────
(
    'axis-cashback', 'Axis Bank', 'Axis Bank Cashback Credit Card',
    1000, 'Waived on ₹4,00,000 annual spend', 1000, 'Visa', 'mid',
    '[{"type":"cashback","rate":2,"merchant":"Online spends up to ₹5,000/month"},{"type":"cashback","rate":5,"merchant":"Online spends ₹5,001-₹40,000/month"},{"type":"cashback","rate":7,"merchant":"Online spends above ₹40,000/month"},{"type":"cashback","rate":0.75,"merchant":"Offline and travel spends"},{"type":"cashback","rate":0.5,"merchant":"Utility bills (capped ₹100/month)"}]'::jsonb,
    '{"type":"cashback","default_rate":0.0075,"note":"Tiered online cashback: 2% up to ₹5K, 5% ₹5K-40K, 7% above ₹40K. Max ₹4,000 online cashback per statement month. 0.75% unlimited on offline/travel. 0.5% on utility capped at ₹100/month.","categories":[{"keywords":["online"],"rate":"tiered","tiers":[{"max_spend":5000,"rate":0.02,"max_cashback":100},{"max_spend":40000,"rate":0.05,"max_cashback":1750},{"max_spend":99999999,"rate":0.07,"max_cashback":2150}],"combined_monthly_cap":4000},{"keywords":["utility","bill"],"rate":0.005,"max_cap_amount_monthly":100}],"exclusions":["fuel","emi","wallet","rent","education"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":5000,"fee":500},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":99999999,"fee":1200}]}'::jsonb,
    'None',
    true,
    ARRAY['online-shopping','cashback'],
    true,
    ARRAY['Up to 7% cashback on high online spends','0.75% unlimited offline cashback','5,000 welcome EDGE RPs (₹1,000 value)','25% EazyDiner dining discount'],
    ARRAY['₹4K monthly online cashback cap','₹4L fee waiver is steep','No lounge access','0.5% utility cap at just ₹100/month']
),

-- ───────────────────────────────────────────────────────────────────────
-- 5. AXIS BANK MY ZONE CREDIT CARD
-- Source: paisabazaar.com (verified March 2026)
-- Fee: ₹500 | Waiver at ₹1,50,000 | Lifestyle & Entertainment
-- ───────────────────────────────────────────────────────────────────────
(
    'axis-myzone', 'Axis Bank', 'Axis Bank My Zone Credit Card',
    500, 'Waived on ₹1,50,000 annual spend (LTF via select channels)', 500, 'Visa', 'entry',
    '[{"type":"points","rate":4,"merchant":"All spends per ₹200"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.20,"spend_divisor":200,"default_rate":4,"note":"4 EDGE RPs per ₹200. Key value from lifestyle discounts: 40% EazyDiner, BOGO movies on District, ₹120 off Swiggy. SonyLiv Premium welcome.","categories":[],"exclusions":["fuel","emi","wallet","rent","education","utility","gaming"]}'::jsonb,
    '{"apr_monthly":3.6,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":5000,"fee":500},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":99999999,"fee":1200}],"note":"1% fee: rent, education, wallet >₹10K, fuel >₹50K, utility >₹25K, gaming >₹10K"}'::jsonb,
    '4 Domestic lounge visits/year (1/quarter on ₹50K prev 3-month spend)',
    true,
    ARRAY['entertainment','dining','lifestyle'],
    true,
    ARRAY['Complimentary SonyLiv Premium on activation','BOGO movies on District app','₹120 off Swiggy (2x/month)','40% off EazyDiner','4 domestic lounges'],
    ARRAY['Reward earn rate is 0.4% effective (4 RPs × ₹0.20 per ₹200)','Heavy exclusion list','₹500 fee not waived easily']
),

-- ───────────────────────────────────────────────────────────────────────
-- 6. AXIS BANK REWARDS CREDIT CARD
-- Source: paisabazaar.com (verified March 2026)
-- Fee: ₹1,000 | Waiver at ₹2,00,000 | 10X on apparel/dept stores
-- ───────────────────────────────────────────────────────────────────────
(
    'axis-rewards', 'Axis Bank', 'Axis Bank Rewards Credit Card',
    1000, 'Waived on ₹2,00,000 annual spend', 1000, 'Visa', 'mid',
    '[{"type":"points","rate":10,"merchant":"Apparel and Departmental stores per ₹200"},{"type":"points","rate":2,"merchant":"All other spends per ₹200"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.20,"spend_divisor":200,"default_rate":2,"note":"1,000 EDGE RPs on activation. 10X on apparel/departmental stores. Standard Axis exclusion rules apply.","categories":[{"keywords":["apparel","clothing","departmental","lifestyle","fashion"],"rate":10}],"exclusions":["fuel","emi","wallet","rent","education"]}'::jsonb,
    '{"apr_monthly":3.6,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":5000,"fee":500},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":99999999,"fee":1200}]}'::jsonb,
    '4 Domestic lounge visits/year',
    true,
    ARRAY['shopping','apparel','lifestyle'],
    true,
    ARRAY['10X EDGE RPs on apparel and departmental stores','1,000 RP welcome bonus','4 domestic lounges','Swiggy discounts'],
    ARRAY['Base earn 2 RPs/₹200 = 0.2% effective','10X only on specific retail categories','₹2L fee waiver']
),

-- ───────────────────────────────────────────────────────────────────────
-- 7. AXIS BANK HORIZON CREDIT CARD
-- Source: paisabazaar.com (verified March 2026)
-- Fee: ₹3,000 | No waiver | Travel EDGE Miles focused
-- ───────────────────────────────────────────────────────────────────────
(
    'axis-horizon', 'Axis Bank', 'Axis Bank Horizon Credit Card',
    3000, 'No annual fee waiver — renewal fee ₹3,000 must be paid', 3000, 'Visa', 'premium',
    '[{"type":"miles","rate":5,"merchant":"Travel EDGE Portal, Direct airline websites per ₹100"},{"type":"miles","rate":2,"merchant":"All other retail per ₹100"}]'::jsonb,
    '{"type":"miles","point_value_rupees":1.0,"spend_divisor":100,"default_rate":2,"note":"5,000 EDGE Miles welcome on ₹1K spend in 30 days. 1,500 EDGE Miles renewal benefit. 1 EDGE Mile = ₹1 on Travel EDGE. 1:1 transfer to 19+ airline/hotel partners. Up to 4L miles/year to Air India.","categories":[{"keywords":["travel edge","airline","flight"],"rate":5}],"exclusions":["fuel","rent","utility","insurance","government","education","toll","wallet"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":5000,"fee":500},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":99999999,"fee":1200}]}'::jsonb,
    '8 Domestic lounge visits/quarter + 2 International (Priority Pass)/quarter',
    true,
    ARRAY['travel','miles','premium'],
    true,
    ARRAY['5 EDGE Miles per ₹100 on travel (5% value)','1:1 transfer to 19+ airline partners','Massive lounge access (8 domestic + 2 intl per quarter)','5,000 EDGE Miles welcome'],
    ARRAY['No fee waiver — ₹3,000 paid annually no matter what','3.5% forex markup (high for a travel card)','Heavy exclusion list']
),

-- ───────────────────────────────────────────────────────────────────────
-- 8. AXIS BANK ATLAS CREDIT CARD
-- Source: paisabazaar.com (verified March 2026)
-- Fee: ₹5,000 | No waiver | Premium Miles card
-- ───────────────────────────────────────────────────────────────────────
(
    'axis-atlas', 'Axis Bank', 'Axis Bank Atlas Credit Card',
    5000, 'No annual fee waiver listed', 5000, 'Visa', 'premium',
    '[{"type":"miles","rate":5,"merchant":"Travel spends per ₹100 (up to ₹2L/month)"},{"type":"miles","rate":2,"merchant":"Travel spends per ₹100 (above ₹2L/month)"},{"type":"miles","rate":2,"merchant":"All other spends per ₹100"}]'::jsonb,
    '{"type":"miles","point_value_rupees":1.0,"spend_divisor":100,"default_rate":2,"note":"2,500 EDGE Miles welcome on 1st txn in 37 days. 1 EDGE Mile = ₹1 on Travel EDGE. 1 EDGE Mile = 2 partner points. Milestone tiers: Silver ₹3L = 2,500 miles, Gold ₹7L = 2,500, Platinum ₹15L = 5,000+5,000.","categories":[{"keywords":["travel","flight","hotel","travel edge"],"rate":5,"max_monthly_spend_for_rate":200000}],"exclusions":["fuel","emi","wallet","rent","education","insurance"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":5000,"fee":500},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":99999999,"fee":1200}]}'::jsonb,
    'Lounge access varies by tier (domestic + international via Priority Pass)',
    true,
    ARRAY['travel','miles','premium'],
    true,
    ARRAY['5 Miles/₹100 on travel (5% value)','1:2 transfer ratio to partners','Milestone bonuses up to Platinum','2,500 welcome EDGE Miles'],
    ARRAY['No fee waiver — ₹5,000/year mandatory','Travel earn drops to 2/₹100 above ₹2L/month','3.5% forex markup']
),

-- ───────────────────────────────────────────────────────────────────────
-- 9. AXIS BANK MAGNUS CREDIT CARD
-- Source: paisabazaar.com (verified March 2026)
-- Fee: ₹12,500 | Waiver at ₹25,00,000 | Premium Travel
-- ───────────────────────────────────────────────────────────────────────
(
    'axis-magnus', 'Axis Bank', 'Axis Bank Magnus Credit Card',
    12500, 'Waived on ₹25,00,000 annual spend', 12500, 'Visa', 'super-premium',
    '[{"type":"points","rate":12,"merchant":"Per ₹200 (monthly spend up to ₹1.5L)"},{"type":"points","rate":35,"merchant":"Per ₹200 (monthly spend above ₹1.5L)"},{"type":"points","rate":60,"merchant":"Travel EDGE per ₹200 (up to ₹2L/month)"},{"type":"points","rate":35,"merchant":"Travel EDGE per ₹200 (above ₹2L/month)"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.20,"spend_divisor":200,"default_rate":12,"note":"CORRECTED: 1 EDGE RP = ₹0.20. Base: 12 EDGE/₹200. Accelerated: 35 if monthly >₹1.5L. Travel EDGE: 60 up to ₹2L/month, drops to 35 above ₹2L. Conversion ratio reduced from 5:4 to 5:2 (5:4 still for Burgundy). Transfer fee INR 199 per redemption added 2026.","categories":[{"keywords":["travel edge"],"rate":60,"max_monthly_spend_for_rate":200000}],"exclusions":["fuel","emi","wallet","rent","insurance"]}'::jsonb,
    '{"apr_monthly":3.6,"interest_free_period_days":50,"forex_markup_percent":1.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":5000,"fee":500},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":99999999,"fee":1200}],"note":"1.5% forex — NOT nil. Nil is only for Primus/Burgundy/Olympus."}'::jsonb,
    'Unlimited Domestic & International (Priority Pass) on ₹50K spend in last 3 months',
    true,
    ARRAY['travel','high-spenders','premium-lifestyle'],
    true,
    ARRAY['Massive 35-60 EDGE multiplier for high spenders','Unlimited global lounge access','₹12,500 Postcard Hotel welcome voucher','Low 1.5% forex','30% Dining Delights'],
    ARRAY['₹12,500 fee','Useless below ₹1.5L/month spend','₹199 transfer fee added 2026','₹25L waiver threshold']
),

-- ───────────────────────────────────────────────────────────────────────
-- 10. INDIANOIL AXIS BANK CREDIT CARD
-- Source: paisabazaar.com (verified March 2026)
-- Fee: ₹500 | Waiver at ₹50,000 | 4% IOCL fuel
-- ───────────────────────────────────────────────────────────────────────
(
    'axis-indianoil', 'Axis Bank', 'IndianOil Axis Bank Credit Card',
    500, 'Waived on ₹50,000 annual spend', 500, 'RuPay', 'entry',
    '[{"type":"points","rate":20,"merchant":"Fuel at IndianOil outlets per ₹100 (4% value back)"},{"type":"points","rate":5,"merchant":"Online shopping per ₹100 (1% value back)"},{"type":"points","rate":1,"merchant":"All other spends per ₹100"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.20,"spend_divisor":100,"default_rate":1,"note":"20 EDGE RPs/₹100 at IOCL = 4% value back. Fuel earn capped at 1,000 RPs/month for fuel txns ₹400-₹4,000. Online earn capped at ₹5K/month. 1 EDGE RP = ₹0.20.","categories":[{"keywords":["indianoil","iocl","fuel","petrol","diesel"],"rate":20,"max_cap_points_monthly":1000},{"keywords":["online","shopping"],"rate":5,"max_monthly_spend":5000}],"exclusions":["wallet","rent","education","emi"]}'::jsonb,
    '{"apr_monthly":3.6,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":5000,"fee":500},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":99999999,"fee":1200}]}'::jsonb,
    'None',
    true,
    ARRAY['fuel','indianoil'],
    true,
    ARRAY['4% value back at IndianOil','500 RP welcome bonus','1% fuel surcharge waiver (₹200-₹5K, max ₹50/cycle)','RuPay — UPI enabled','Low ₹500 fee, ₹50K waiver'],
    ARRAY['Fuel earn capped at 1,000 RPs/month','1 EDGE RP = only ₹0.20','No lounge access','Fuel surcharge waiver capped at ₹50']
),

-- ───────────────────────────────────────────────────────────────────────
-- 11. SAMSUNG AXIS BANK SIGNATURE CREDIT CARD
-- Source: paisabazaar.com (verified March 2026)
-- Fee: ₹500 | Waiver at ₹2,00,000 | 10% Samsung, 10X partners
-- ───────────────────────────────────────────────────────────────────────
(
    'axis-samsung', 'Axis Bank', 'Samsung Axis Bank Signature Credit Card',
    500, 'Waived on ₹2,00,000 annual spend', 500, 'Visa', 'mid',
    '[{"type":"cashback","rate":10,"merchant":"Samsung purchases (incl EMI)"},{"type":"points","rate":10,"merchant":"Myntra, Zomato, Urban Company, BigBasket, Tata 1mg per ₹100"},{"type":"points","rate":5,"merchant":"All other spends per ₹100"}]'::jsonb,
    '{"type":"hybrid","note":"10% cashback on Samsung capped at ₹2,500/month and ₹10,000/year. 10 EDGE RPs/₹100 on preferred partners. 5 EDGE RPs/₹100 on everything else. 2,500 EDGE RP welcome on 3 txns in 30 days.","categories":[{"keywords":["samsung"],"rate":0.10,"max_cap_amount_monthly":2500,"max_cap_amount_yearly":10000},{"keywords":["myntra","zomato","urban company","bigbasket","tata 1mg"],"rate":10},{"keywords":["all"],"rate":5}],"exclusions":["fuel","emi","wallet","rent","education"]}'::jsonb,
    '{"apr_monthly":3.6,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":5000,"fee":500},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":99999999,"fee":1200}]}'::jsonb,
    '4 Domestic lounge visits/year',
    true,
    ARRAY['samsung','tech','lifestyle'],
    true,
    ARRAY['10% cashback on Samsung (even EMI)','10X on Myntra/Zomato/BigBasket','Low ₹500 fee','4 domestic lounges','25% EazyDiner discount'],
    ARRAY['Samsung cashback capped ₹2,500/month, ₹10K/year','₹2L fee waiver threshold','1% surcharges on rent/education/wallet']
),

-- ───────────────────────────────────────────────────────────────────────
-- 12. AXIS BANK PRIVILEGE CREDIT CARD
-- Source: paisabazaar.com (verified March 2026)
-- Fee: ₹1,500 | Waiver at ₹5,00,000
-- ───────────────────────────────────────────────────────────────────────
(
    'axis-privilege', 'Axis Bank', 'Axis Bank Privilege Credit Card',
    1500, 'Waived on ₹5,00,000 annual spend', 1500, 'Visa', 'mid',
    '[{"type":"points","rate":10,"merchant":"All spends per ₹200"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.20,"spend_divisor":200,"default_rate":10,"note":"12,500 EDGE RPs welcome on activation. 10 EDGE RPs per ₹200 = 1% effective value. Lounge access included.","categories":[],"exclusions":["fuel","emi","wallet","rent","education"]}'::jsonb,
    '{"apr_monthly":3.6,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":5000,"fee":500},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":99999999,"fee":1200}]}'::jsonb,
    '8 Domestic lounge visits/year',
    true,
    ARRAY['lifestyle','rewards'],
    true,
    ARRAY['12,500 EDGE RPs welcome (₹2,500 value)','1% effective earn rate','8 domestic lounge visits'],
    ARRAY['₹5L waiver threshold is steep','1% earn rate is average for a ₹1,500 fee card']
),

-- ───────────────────────────────────────────────────────────────────────
-- 13. AXIS BANK SELECT CREDIT CARD
-- Source: paisabazaar.com (verified March 23, 2026)
-- Fee: ₹3,000 | Waiver at ₹8,00,000 | 2X shopping, lounge, golf
-- ───────────────────────────────────────────────────────────────────────
(
    'axis-select', 'Axis Bank', 'Axis Bank SELECT Credit Card',
    3000, 'Waived on ₹8,00,000 annual spend (free for Burgundy customers)', 3000, 'Visa', 'premium',
    '[{"type":"points","rate":20,"merchant":"Retail shopping per ₹200 (up to ₹20K/month, 2X)"},{"type":"points","rate":10,"merchant":"All other spends per ₹200"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.20,"spend_divisor":200,"default_rate":10,"note":"10,000 EDGE RPs welcome (₹2,000 value) on 1st txn in 30 days (not for LTF/Burgundy). 2X (20 RPs/₹200) on retail shopping up to ₹20K/month. 5,000 milestone RPs on ₹3L spend in card anniversary year. 6 free golf rounds + 6 more on ₹3L spend.","categories":[{"keywords":["retail","shopping","online","offline"],"rate":20,"max_monthly_spend_for_rate":20000}],"exclusions":["fuel","emi","wallet","rent","education"]}'::jsonb,
    '{"apr_monthly":3.6,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":5000,"fee":500},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":99999999,"fee":1200}]}'::jsonb,
    '8 Domestic (2/quarter on ₹50K prev 3-month spend) + 12 International (Priority Pass)/year',
    true,
    ARRAY['shopping','lifestyle','golf','premium'],
    true,
    ARRAY['2X on retail shopping (2% effective up to ₹20K/month)','12 international lounge visits (Priority Pass)','6-12 free golf rounds','₹500/month BigBasket voucher','₹200 off Swiggy 2x/month','BOGO movies on District'],
    ARRAY['₹8L fee waiver is very high','₹3,000 fee','2X capped at ₹20K/month spend','Domestic lounge needs ₹50K quarterly spend']
),

-- ───────────────────────────────────────────────────────────────────────
-- 14. AXIS BANK NEO CREDIT CARD
-- Source: paisabazaar.com (verified Feb 2026)
-- Fee: ₹250 annual | ₹0 joining | Entry level
-- ───────────────────────────────────────────────────────────────────────
(
    'axis-neo', 'Axis Bank', 'Axis Bank Neo Credit Card',
    250, 'Check axisbank.com for LTF promotions', 0, 'Visa', 'entry',
    '[{"type":"points","rate":2,"merchant":"All spends per ₹200"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.20,"spend_divisor":200,"default_rate":2,"note":"Very basic entry card. Main value from partner discounts (Zomato, Amazon Pay) rather than point accumulation. 2 EDGE RPs per ₹200 = 0.2% effective.","categories":[],"exclusions":["fuel","emi","wallet"]}'::jsonb,
    '{"apr_monthly":3.6,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":5000,"fee":500},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":99999999,"fee":1200}]}'::jsonb,
    'None',
    true,
    ARRAY['entry-level','students','beginners'],
    true,
    ARRAY['₹0 joining fee','Very low ₹250 annual fee','Basic entry card for building credit'],
    ARRAY['Earn rate 0.2% effective — abysmal','No lounge access','No significant partner benefits']
);

COMMIT;

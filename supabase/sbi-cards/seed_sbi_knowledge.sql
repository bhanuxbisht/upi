BEGIN;
 
-- ═══════════════════════════════════════════════════════════════════
-- SBI CARD — CORRECTED & VERIFIED MASTER SEED
-- Sources: sbicard.com MITC (official PDF Nov 2025), sbicard.com/customer-notices,
--          paisabazaar.com, cardinsider.com, cardmaven.in (cross-verified March 2026)
-- ═══════════════════════════════════════════════════════════════════
 
ALTER TABLE knowledge_credit_cards ADD COLUMN IF NOT EXISTS reward_math JSONB;
ALTER TABLE knowledge_credit_cards ADD COLUMN IF NOT EXISTS penalties JSONB;
 
DELETE FROM knowledge_credit_cards WHERE bank = 'SBI Card';
 
-- ─────────────────────────────────────────────────────────────────
-- 1. CASHBACK SBI CARD
-- ─────────────────────────────────────────────────────────────────
INSERT INTO knowledge_credit_cards (
    id, bank, name, annual_fee, fee_waiver, joining_fee, network, tier,
    rewards, reward_math, penalties, lounge_access, fuel_surcharge_waiver, best_for, is_active, pros, cons
) VALUES (
    'sbi-cashback', 'SBI Card', 'CASHBACK SBI Card',
    999, 'Waived on ₹2,00,000 annual spend', 999, 'Visa', 'mid',
    '[{"type":"cashback","rate":5,"merchant":"All online (no merchant restriction)"},{"type":"cashback","rate":1,"merchant":"All offline (POS)"}]'::jsonb,
    '{"type":"cashback","default_rate":0.01,"max_cashback_monthly":5000,"note":"From 1 Apr 2026: cap splits to ₹2,000 online + ₹2,000 offline = ₹4,000 total. Also from 1 Apr 2026: Digital gaming, Tolls, Government transactions excluded in addition to existing exclusions.","categories":[{"keywords":["online","app","website","ecommerce"],"rate":0.05,"max_cap_cashback_monthly":5000}],"exclusions":["fuel","wallet","rent","utility","insurance","jewelry","railways","education","digital_gaming","toll","government","emi","flexipay"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'None',
    true,
    ARRAY['online-shopping'],
    true,
    ARRAY['5% cashback on ALL online merchants — no co-brand restriction','Cashback auto-credited within 2 days of statement generation','₹1 = ₹1 cashback, no complex points conversion','1% fuel surcharge waiver at all petrol pumps (₹500–₹3,000 txns, max ₹100/cycle)'],
    ARRAY['Monthly cashback capped at ₹5,000 (splits to ₹2,000 online + ₹2,000 offline from 1 Apr 2026)','Exclusions: fuel, utility, insurance, rent, wallet, jewelry, railways, education, government, digital gaming','No lounge access']
),
-- ─────────────────────────────────────────────────────────────────
-- 2. SIMPLYCLICK SBI CARD
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-simplyclick', 'SBI Card', 'SimplyCLICK SBI Card',
    499, 'Waived on ₹1,00,000 annual spend', 499, 'Visa', 'entry',
    '[{"type":"points","rate":10,"merchant":"Apollo 24x7, BookMyShow, Cleartrip, Dominos, Gyftr, IGP, Myntra, Netmeds, Yatra (10X partners)"},{"type":"points","rate":5,"merchant":"All other online spends"},{"type":"points","rate":1,"merchant":"All offline spends"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.25,"spend_divisor":100,"default_rate":1,"note":"Swiggy downgraded from 10X to 5X w.e.f 1 Apr 2025. Gyftr added as 10X partner from 10 Feb 2025. Combined 10X+5X bonus points capped at 10,000 pts/month each.","categories":[{"keywords":["apollo","bookmyshow","cleartrip","dominos","gyftr","igp","myntra","netmeds","yatra"],"rate":10,"max_cap_points_monthly":10000},{"keywords":["online","swiggy","zomato","amazon","flipkart"],"rate":5,"max_cap_points_monthly":10000}],"exclusions":["fuel","rent","wallet","cash_advance","balance_transfer","flexipay"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'None',
    false,
    ARRAY['online-shopping'],
    true,
    ARRAY['10X on 8 partner brands (2.5% effective value)','5X on all other online (1.25% effective value)','₹2,000 Cleartrip/Yatra e-voucher on ₹1L + ₹2L annual online spend','₹500 Amazon welcome voucher on annual fee payment'],
    ARRAY['10X bonus capped at 10,000 pts/month per category','No lounge access','1 RP = ₹0.25 — low point value','₹99 redemption fee per redemption transaction']
),
-- ─────────────────────────────────────────────────────────────────
-- 3. SIMPLYSAVE SBI CARD
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-simplysave', 'SBI Card', 'SimplySAVE SBI Card',
    499, 'Waived on ₹1,00,000 annual spend', 499, 'Visa', 'entry',
    '[{"type":"points","rate":10,"merchant":"Dining, Movies, Departmental Stores, Grocery"},{"type":"points","rate":1,"merchant":"All other spends"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.25,"spend_divisor":150,"default_rate":1,"categories":[{"keywords":["dining","restaurant","movie","grocery","departmental","supermarket"],"rate":10}],"exclusions":["fuel","wallet","cash_advance"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'None',
    false,
    ARRAY['offline-shopping','dining'],
    true,
    ARRAY['10X points on dining, movies, grocery, departmental stores','Low ₹1L fee waiver threshold','Easy approval entry card'],
    ARRAY['1 RP = ₹0.25 — low point value','Poor online rewards (only 1X on all online)','No lounge access']
),
-- ─────────────────────────────────────────────────────────────────
-- 4. FLIPKART SBI CARD
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-flipkart', 'SBI Card', 'Flipkart SBI Card',
    500, 'Waived on ₹3,50,000 annual spend', 500, 'Visa', 'entry',
    '[{"type":"cashback","rate":7.5,"merchant":"Myntra"},{"type":"cashback","rate":5,"merchant":"Flipkart"},{"type":"cashback","rate":1.5,"merchant":"Cleartrip"},{"type":"cashback","rate":1,"merchant":"All other online"},{"type":"cashback","rate":0.5,"merchant":"Offline"}]'::jsonb,
    '{"type":"cashback","default_rate":0.005,"categories":[{"keywords":["myntra"],"rate":0.075},{"keywords":["flipkart"],"rate":0.05},{"keywords":["cleartrip"],"rate":0.015},{"keywords":["online","app","website"],"rate":0.01}],"exclusions":["fuel","wallet","rent","emi"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'None',
    true,
    ARRAY['flipkart','online-shopping'],
    true,
    ARRAY['7.5% direct cashback on Myntra','5% on Flipkart (all categories)','1% fuel surcharge waiver'],
    ARRAY['High ₹3.5L fee waiver threshold for a ₹500 card','Useful mainly for Flipkart/Myntra shoppers','No lounge access']
),
-- ─────────────────────────────────────────────────────────────────
-- 5. SBI CARD PRIME
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-prime', 'SBI Card', 'SBI Card PRIME',
    2999, 'Waived on ₹3,00,000 annual spend', 2999, 'Visa', 'premium',
    '[{"type":"points","rate":10,"merchant":"Dining, Movies, Grocery, Departmental Stores"},{"type":"points","rate":20,"merchant":"Birthday spend (1 day before + on + 1 day after, capped ₹2,000 pts/year)"},{"type":"points","rate":2,"merchant":"All other spends"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.25,"spend_divisor":100,"default_rate":2,"categories":[{"keywords":["dining","restaurant","movie","grocery","departmental","supermarket"],"rate":10},{"keywords":["birthday"],"rate":20,"max_cap_points_yearly":2000}],"milestones":[{"spend":50000,"period":"quarter","reward":"Pizza Hut e-voucher ₹1,000"},{"spend":500000,"period":"annual","reward":"e-gift voucher ₹7,000 (Yatra/Pantaloons)"}],"exclusions":["fuel","cash_advance","wallet"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '8 Domestic + 4 International (via Priority Pass, max 2/quarter) lounge visits/year',
    true,
    ARRAY['dining','grocery','travel'],
    true,
    ARRAY['10X on dining/movies/grocery/departmental (2.5% effective value)','20X on birthday spends','₹7,000 e-voucher on ₹5L annual spend','₹1,000 Pizza Hut e-voucher on ₹50K quarterly spend','Welcome gift ₹3,000 voucher','8 domestic + 4 international lounge visits/year','Club ITC Silver Tier membership (for cards sourced from 1 Sep 2025)'],
    ARRAY['Base rate only 0.5% (2 RPs per ₹100 × ₹0.25)','Club Vistara benefit DISCONTINUED for renewals from 1 Apr 2025','Air accident insurance discontinued 15 Jul 2025','High ₹3L fee waiver','1 RP = ₹0.25 — low point value']
),
-- ─────────────────────────────────────────────────────────────────
-- 6. SBI CARD ELITE
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-elite', 'SBI Card', 'SBI Card ELITE',
    4999, 'Waived on ₹10,00,000 annual spend', 4999, 'Visa', 'premium',
    '[{"type":"points","rate":10,"merchant":"Dining, Grocery, Departmental Stores (5X)"},{"type":"points","rate":2,"merchant":"All other spends (incl. international)"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.25,"spend_divisor":100,"default_rate":2,"note":"5X = 10 RPs per ₹100 on dining/grocery/departmental. 2 RPs per ₹100 on international transactions same as base. 10X accelerated capped at 10,000 pts/month.","categories":[{"keywords":["dining","restaurant","grocery","departmental","supermarket"],"rate":10,"max_cap_points_monthly":10000}],"milestones":[{"spend":300000,"bonus_points":10000},{"spend":400000,"bonus_points":10000},{"spend":500000,"bonus_points":15000},{"spend":800000,"bonus_points":15000}],"exclusions":["fuel","cash_advance","wallet","emi","flexipay"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":1.99,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '8 Domestic (2/quarter) + 6 International via Priority Pass (2/quarter) lounge visits/year',
    true,
    ARRAY['high-spenders','lifestyle'],
    true,
    ARRAY['Lowest forex markup at 1.99%','5X on dining/grocery/departmental (2.5% effective)','Up to 50,000 bonus RPs/year on spend milestones (worth ₹12,500)','Free movie tickets ₹6,000/year (2 tickets/month @ ₹250 discount each)','Welcome gift ₹5,000 voucher','8 domestic + 6 international lounge visits','Club ITC Silver Tier membership (cards from 1 Sep 2025)'],
    ARRAY['Extreme ₹10L annual fee waiver condition','Base reward rate only 0.5%','Club Vistara + Trident membership effectively discontinued','Air accident insurance discontinued 15 Jul 2025']
),
-- ─────────────────────────────────────────────────────────────────
-- 7. SBI CARD PULSE
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-pulse', 'SBI Card', 'SBI Card PULSE',
    1499, 'Waived on ₹2,00,000 annual spend', 1499, 'Visa', 'mid',
    '[{"type":"points","rate":10,"merchant":"Pharmacy, Sports, Gym, Dining, Movies"},{"type":"points","rate":2,"merchant":"All other spends"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.25,"spend_divisor":100,"default_rate":2,"categories":[{"keywords":["pharmacy","chemist","sports","gym","fitness","dining","movie","health"],"rate":10}],"exclusions":["fuel","cash_advance","wallet"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '4 Domestic lounge visits/year',
    true,
    ARRAY['health','pharmacy'],
    true,
    ARRAY['Complimentary FITPASS Pro subscription (fitness)','Complimentary Netmeds membership (pharmacy discounts)','10X on pharmacy, gym, sports, dining, movies (2.5% effective)','Annual ₹1,499 Netmeds voucher on ₹2L annual spend'],
    ARRAY['Niche health-focused card','Air accident insurance discontinued 15 Jul 2025','Low base rate of 0.5%','1 RP = ₹0.25']
),
-- ─────────────────────────────────────────────────────────────────
-- 8. BPCL SBI CARD
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-bpcl', 'SBI Card', 'BPCL SBI Card',
    499, 'Waived on ₹50,000 annual spend', 499, 'Visa', 'entry',
    '[{"type":"points","rate":13,"merchant":"BPCL fuel stations"},{"type":"points","rate":5,"merchant":"Dining, Grocery, Movies, Departmental Stores"},{"type":"points","rate":1,"merchant":"All other spends"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.25,"spend_divisor":100,"default_rate":1,"categories":[{"keywords":["bpcl","fuel","petrol","diesel"],"rate":13,"max_cap_points_monthly":1300},{"keywords":["dining","grocery","movie","departmental","supermarket"],"rate":5,"max_cap_points_monthly":5000}],"exclusions":["wallet","rent","emi"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'None',
    true,
    ARRAY['fuel','bpcl'],
    true,
    ARRAY['13X on BPCL fuel = 3.25% effective value (13 RPs × ₹0.25 per ₹100)','1% fuel surcharge waiver at BPCL stations','Very low ₹50K fee waiver threshold','5X on dining/grocery/movies'],
    ARRAY['BPCL fuel cap at 1,300 pts/month','Dining/grocery 5X capped at 5,000 pts/month','Only useful at BPCL pumps for maximum value','No lounge access']
),
-- ─────────────────────────────────────────────────────────────────
-- 9. BPCL SBI CARD OCTANE
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-bpcl-octane', 'SBI Card', 'BPCL SBI Card OCTANE',
    1499, 'Waived on ₹2,00,000 annual spend', 1499, 'Visa', 'mid',
    '[{"type":"points","rate":25,"merchant":"BPCL fuel, Bharat Gas"},{"type":"points","rate":10,"merchant":"Dining, Grocery, Movies, Departmental Stores"},{"type":"points","rate":1,"merchant":"All other spends"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.25,"spend_divisor":100,"default_rate":1,"note":"25 RPs × ₹0.25 per ₹100 = 6.25% reward value on BPCL fuel + 1% surcharge waiver = 7.25% total saving","categories":[{"keywords":["bpcl","fuel","petrol","diesel","bharat gas","gas"],"rate":25,"max_cap_points_monthly":2500},{"keywords":["dining","grocery","movie","departmental"],"rate":10,"max_cap_points_monthly":7500}],"exclusions":["wallet","rent","emi"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '4 Domestic lounge visits/year',
    true,
    ARRAY['fuel','dining','bpcl'],
    true,
    ARRAY['6.25% RP value on BPCL fuel + 1% surcharge waiver = 7.25% total effective saving','10X on dining/grocery/movies (2.5% effective)','4 domestic lounge visits'],
    ARRAY['Fuel capped at 2,500 pts/month (max ₹10K fuel spend for full benefit)','Dining/grocery 10X capped at 7,500 pts/month','Only useful at BPCL for max value']
),
-- ─────────────────────────────────────────────────────────────────
-- 10. INDIGO SBI CARD
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-indigo', 'SBI Card', 'IndiGo SBI Card',
    1499, 'None', 1499, 'Visa', 'mid',
    '[{"type":"6e_rewards","rate":3,"merchant":"IndiGo flights per ₹100"},{"type":"6e_rewards","rate":2,"merchant":"Hotel, Travel per ₹100"},{"type":"6e_rewards","rate":1,"merchant":"All other spends per ₹100"}]'::jsonb,
    '{"type":"points","point_value_rupees":1.0,"spend_divisor":100,"default_rate":1,"note":"1 6E Reward = ₹1, redeemable only on IndiGo website/app","categories":[{"keywords":["indigo","flight","goindigo"],"rate":3},{"keywords":["hotel","travel"],"rate":2}],"exclusions":["utility","fuel","wallet"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '4 Domestic lounge visits/year',
    true,
    ARRAY['travel','indigo'],
    true,
    ARRAY['3% reward value on IndiGo flights','4 domestic lounge visits'],
    ARRAY['No annual fee waiver option','6E Rewards redeemable only on IndiGo','Co-branded card with limited utility outside IndiGo']
),
-- ─────────────────────────────────────────────────────────────────
-- 11. INDIGO SBI CARD ELITE
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-indigo-elite', 'SBI Card', 'IndiGo SBI Card ELITE',
    4999, 'None', 4999, 'Visa', 'premium',
    '[{"type":"6e_rewards","rate":7,"merchant":"IndiGo flights per ₹100"},{"type":"6e_rewards","rate":3,"merchant":"Hotel, Travel per ₹100"},{"type":"6e_rewards","rate":2,"merchant":"All other spends per ₹100"}]'::jsonb,
    '{"type":"points","point_value_rupees":1.0,"spend_divisor":100,"default_rate":2,"note":"1 6E Reward = ₹1, redeemable only on IndiGo website/app","categories":[{"keywords":["indigo","flight","goindigo"],"rate":7},{"keywords":["hotel","travel"],"rate":3}],"exclusions":["utility","fuel","wallet"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '8 Domestic + 6 International lounge visits/year',
    true,
    ARRAY['travel','indigo'],
    true,
    ARRAY['7% reward value on IndiGo flights','8 domestic + 6 international lounge visits'],
    ARRAY['No fee waiver option at any spend level','6E Rewards redeemable only on IndiGo','Very high ₹4,999 fee']
),
-- ─────────────────────────────────────────────────────────────────
-- 12. KRISFLYER SBI CARD
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-krisflyer', 'SBI Card', 'KrisFlyer SBI Card',
    2999, 'None', 2999, 'Visa', 'premium',
    '[{"type":"miles","rate":5,"merchant":"Singapore Airlines bookings per ₹200"},{"type":"miles","rate":2,"merchant":"All other spends per ₹200"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.5,"spend_divisor":200,"default_rate":2,"note":"Miles credited to KrisFlyer account. 1 KrisFlyer mile ≈ ₹0.50 value in redemption","categories":[{"keywords":["singapore airlines","krisflyer","silkair"],"rate":5},{"keywords":["international","flight","travel"],"rate":2}],"exclusions":["fuel","wallet","rental"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '4 Domestic + 4 International lounge visits/year',
    true,
    ARRAY['singapore-airlines','travel'],
    true,
    ARRAY['Miles credited directly to KrisFlyer account','Good for Singapore Airlines frequent flyers'],
    ARRAY['No fee waiver at any spend level','Niche value — only Singapore Airlines ecosystem','High 3.5% forex markup defeats international usage']
),
-- ─────────────────────────────────────────────────────────────────
-- 13. KRISFLYER SBI CARD APEX
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-krisflyer-apex', 'SBI Card', 'KrisFlyer SBI Card Apex',
    9999, 'None', 9999, 'Visa', 'super-premium',
    '[{"type":"miles","rate":10,"merchant":"Singapore Airlines bookings per ₹200"},{"type":"miles","rate":8,"merchant":"International spends per ₹200"},{"type":"miles","rate":6,"merchant":"All other spends per ₹200"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.5,"spend_divisor":200,"default_rate":6,"note":"Miles credited to KrisFlyer account. Best earn rate for SQ flights","categories":[{"keywords":["singapore airlines","krisflyer"],"rate":10},{"keywords":["international","flight"],"rate":8}],"exclusions":["fuel","wallet","rental"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '8 Domestic + 8 International lounge visits/year',
    true,
    ARRAY['singapore-airlines','super-premium'],
    true,
    ARRAY['Highest KrisFlyer earn rate on Singapore Airlines','8 domestic + 8 international lounge visits'],
    ARRAY['₹9,999 fee with no waiver option','Very niche — Singapore Airlines only','High 3.5% forex markup']
),
-- ─────────────────────────────────────────────────────────────────
-- 14. SBI CARD MILES
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-miles', 'SBI Card', 'SBI Card MILES',
    1499, 'Waived on ₹6,00,000 annual spend', 1499, 'Mastercard', 'entry',
    '[{"type":"travel_credits","rate":2,"merchant":"Travel (flights, hotels) per ₹200"},{"type":"travel_credits","rate":1,"merchant":"All other spends per ₹200"}]'::jsonb,
    '{"type":"points","point_value_rupees":1.0,"spend_divisor":200,"default_rate":1,"note":"Travel Credits can be converted to airline miles or hotel points. 1 Travel Credit = ₹1 towards travel bookings","categories":[{"keywords":["travel","flight","hotel"],"rate":2}],"exclusions":["fuel","emi","wallet","utility","insurance"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.0,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '4 Domestic lounge visits/year',
    true,
    ARRAY['travel'],
    true,
    ARRAY['3% forex markup (lower than standard 3.5%)','Travel credits redeemable for airline miles or hotel points','4 domestic lounge visits'],
    ARRAY['Very high ₹6L fee waiver condition','Low base earn rate (1 TC per ₹200)','Travel credits only — no general redemption']
),
-- ─────────────────────────────────────────────────────────────────
-- 15. SBI CARD MILES PRIME
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-miles-prime', 'SBI Card', 'SBI Card MILES PRIME',
    2999, 'Waived on ₹10,00,000 annual spend', 2999, 'Mastercard', 'premium',
    '[{"type":"travel_credits","rate":4,"merchant":"Travel (flights, hotels) per ₹200"},{"type":"travel_credits","rate":2,"merchant":"All other spends per ₹200"}]'::jsonb,
    '{"type":"points","point_value_rupees":1.0,"spend_divisor":200,"default_rate":2,"note":"8 base domestic lounge visits/year + 1 additional visit per ₹1L spend (capped at 12 additional/year). Travel Credits redeemable for airline miles or hotel points.","categories":[{"keywords":["travel","flight","hotel"],"rate":4}],"exclusions":["fuel","emi","wallet","utility","insurance"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":2.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '8 Domestic (base) + up to 12 additional domestic (1 per ₹1L spend) + 4 International via Priority Pass (max 2/quarter)/year',
    true,
    ARRAY['travel'],
    true,
    ARRAY['2.5% forex markup','8 base domestic lounges + earn additional via spend','4 international Priority Pass visits','Air accident insurance ₹1Cr discontinued 15 Jul 2025'],
    ARRAY['Very high ₹10L fee waiver','Base earn rate only 1 TC per ₹200','Travel credits only — no general redemption']
),
-- ─────────────────────────────────────────────────────────────────
-- 16. SBI CARD MILES ELITE
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-miles-elite', 'SBI Card', 'SBI Card MILES ELITE',
    4999, 'Waived on ₹15,00,000 annual spend', 4999, 'Mastercard', 'super-premium',
    '[{"type":"travel_credits","rate":6,"merchant":"Travel (flights, hotels) per ₹200"},{"type":"travel_credits","rate":2,"merchant":"All other spends per ₹200"}]'::jsonb,
    '{"type":"points","point_value_rupees":1.0,"spend_divisor":200,"default_rate":2,"note":"Travel Credits redeemable for airline miles or hotel points. 1 TC = ₹1.","categories":[{"keywords":["travel","flight","hotel"],"rate":6}],"exclusions":["fuel","emi","wallet","utility","insurance"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":1.99,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '8 Domestic + 6 International lounge visits/year',
    true,
    ARRAY['travel','super-premium'],
    true,
    ARRAY['1.99% forex markup (lowest forex in SBI lineup)','Highest travel credit earn in Miles range','8 domestic + 6 international lounge visits'],
    ARRAY['Extreme ₹15L annual fee waiver condition','Travel credits only — no general redemption']
),
-- ─────────────────────────────────────────────────────────────────
-- 17. IRCTC SBI PLATINUM CARD
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-irctc-plat', 'SBI Card', 'IRCTC SBI Platinum Card',
    300, 'None', 500, 'Visa', 'entry',
    '[{"type":"points","rate":"10% value back","merchant":"IRCTC AC train tickets"},{"type":"points","rate":1,"merchant":"All other spends"}]'::jsonb,
    '{"type":"points","point_value_rupees":1.0,"spend_divisor":125,"default_rate":1,"note":"1 RP = ₹1, earn 10% value back on IRCTC AC class bookings (1 RP per ₹10 spent = 10%). Joining fee ₹500 differs from annual fee ₹300.","categories":[{"keywords":["irctc","train","railway","ac","1ac","2ac","3ac","cc"],"rate":10}],"exclusions":["fuel","wallet","cash_advance"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '4 Railway Lounge (A-category station) visits/year',
    true,
    ARRAY['trains','railway'],
    true,
    ARRAY['10% value back on IRCTC AC train ticket bookings','1 RP = ₹1 (high RP value)','Very low ₹300 annual fee','1% fuel surcharge waiver'],
    ARRAY['No airport lounge access — only railway lounges','Only useful for IRCTC AC bookings','Rail accident insurance discontinued 26 Jul 2025']
),
-- ─────────────────────────────────────────────────────────────────
-- 18. IRCTC SBI CARD PREMIER
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-irctc-prem', 'SBI Card', 'IRCTC SBI Card Premier',
    1499, 'Waived on ₹2,00,000 annual spend', 1499, 'Visa', 'mid',
    '[{"type":"points","rate":"10% value back","merchant":"IRCTC AC train tickets"},{"type":"points","rate":"5% value back","merchant":"IRCTC air tickets, catering"},{"type":"points","rate":3,"merchant":"Dining, Utility per ₹100"}]'::jsonb,
    '{"type":"points","point_value_rupees":1.0,"spend_divisor":125,"default_rate":1,"categories":[{"keywords":["irctc","train","railway","ac"],"rate":10},{"keywords":["irctc","air","catering","flight"],"rate":5},{"keywords":["dining","utility","restaurant"],"rate":3}],"exclusions":["fuel","wallet","cash_advance"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '8 Railway Lounge (A-category station) visits/year',
    true,
    ARRAY['trains','railway'],
    true,
    ARRAY['10% value back on IRCTC AC train bookings','5% on IRCTC air tickets and catering','1 RP = ₹1','8 railway lounge visits','₹2L fee waiver'],
    ARRAY['Only useful within IRCTC ecosystem','No airport lounge access','Rail accident insurance discontinued 26 Jul 2025']
),
-- ─────────────────────────────────────────────────────────────────
-- 19. TATA NEU INFINITY SBI CARD
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-tata-neu-inf', 'SBI Card', 'Tata Neu Infinity SBI Card',
    1499, 'Waived on ₹3,00,000 annual spend', 1499, 'RuPay', 'premium',
    '[{"type":"neucoins","rate":10,"merchant":"Tata brands (BigBasket, Croma, 1mg, Taj, Westside, Tanishq, Titan, Air India, Tata Neu app)"},{"type":"neucoins","rate":1.5,"merchant":"All other spends (non-Tata)"}]'::jsonb,
    '{"type":"neucoins","neucoins_value_rupees":1.0,"spend_divisor":100,"default_rate":1.5,"note":"NeuCoins redeemable ONLY within Tata NeuApp at Tata brand checkouts — NOT as statement credit. UPI rewards via this card earn NeuCoins ONLY through Tata Neu UPI (not GPay/PhonePe/BHIM). Non-Tata UPI transactions earn standard 1.5%.","categories":[{"keywords":["tata","bigbasket","croma","1mg","taj","westside","tanishq","titan","air india","cultfit","tataplay","neuapp"],"rate":10}],"exclusions":["fuel","wallet","rent","emi"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":1.99,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '8 Domestic + 4 International lounge visits/year',
    true,
    ARRAY['tata-brands','upi'],
    true,
    ARRAY['10% NeuCoins on entire Tata ecosystem','1 NeuCoin = ₹1 at Tata brand checkout','1.5% on all non-Tata spends','Low 1.99% forex markup','8 domestic + 4 international lounge visits'],
    ARRAY['NeuCoins locked to Tata NeuApp — NOT redeemable as statement credit','UPI NeuCoins ONLY via Tata Neu UPI — not GPay/PhonePe','Limited to Tata ecosystem for max value']
),
-- ─────────────────────────────────────────────────────────────────
-- 20. TATA NEU PLUS SBI CARD
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-tata-neu-plus', 'SBI Card', 'Tata Neu Plus SBI Card',
    499, 'Waived on ₹1,00,000 annual spend', 499, 'RuPay', 'entry',
    '[{"type":"neucoins","rate":7,"merchant":"Tata brands (BigBasket, Croma, 1mg, Westside, Tanishq, Titan, Tata Neu app)"},{"type":"neucoins","rate":1,"merchant":"All other spends"}]'::jsonb,
    '{"type":"neucoins","neucoins_value_rupees":1.0,"spend_divisor":100,"default_rate":1,"note":"NeuCoins redeemable ONLY within Tata NeuApp — NOT as statement credit. UPI rewards via Tata Neu UPI only.","categories":[{"keywords":["tata","bigbasket","croma","1mg","westside","tanishq","titan","neuapp"],"rate":7},{"keywords":["upi","tata neu upi"],"rate":1}],"exclusions":["fuel","wallet","rent","emi"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '4 Domestic lounge visits/year',
    true,
    ARRAY['tata-brands'],
    true,
    ARRAY['7% NeuCoins on Tata brands','1 NeuCoin = ₹1','Low ₹1L fee waiver','4 domestic lounge visits'],
    ARRAY['NeuCoins locked to Tata NeuApp only','Lower earn rate vs Infinity variant','1% on all non-Tata spends']
),
-- ─────────────────────────────────────────────────────────────────
-- 21. RELIANCE SBI CARD
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-reliance', 'SBI Card', 'Reliance SBI Card',
    499, 'Waived on ₹1,00,000 annual spend', 499, 'Visa', 'entry',
    '[{"type":"points","rate":10,"merchant":"AJIO, JioMart"},{"type":"points","rate":5,"merchant":"Reliance brands, Dining, Movies"},{"type":"points","rate":1,"merchant":"All other spends"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.25,"spend_divisor":100,"default_rate":1,"categories":[{"keywords":["ajio","jiomart"],"rate":10},{"keywords":["reliance","dining","movies","entertainment"],"rate":5}],"exclusions":["upi","fuel","wallet","rent"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'None',
    true,
    ARRAY['reliance','online-shopping'],
    true,
    ARRAY['10X on AJIO and JioMart (2.5% effective value)','5X on Reliance brands/dining/movies'],
    ARRAY['No UPI cashback','Low 1 RP = ₹0.25','No lounge access','Only useful for Reliance ecosystem']
),
-- ─────────────────────────────────────────────────────────────────
-- 22. RELIANCE SBI CARD PRIME
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-reliance-prime', 'SBI Card', 'Reliance SBI Card PRIME',
    2999, 'Waived on ₹3,00,000 annual spend', 2999, 'Visa', 'premium',
    '[{"type":"points","rate":20,"merchant":"AJIO, JioMart"},{"type":"points","rate":10,"merchant":"Reliance brands"},{"type":"points","rate":5,"merchant":"Dining, Movies, Entertainment, Airlines"},{"type":"points","rate":2,"merchant":"All other spends"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.25,"spend_divisor":100,"default_rate":2,"categories":[{"keywords":["ajio","jiomart"],"rate":20},{"keywords":["reliance"],"rate":10},{"keywords":["dining","movie","entertainment","airlines"],"rate":5}],"exclusions":["upi","fuel","wallet","rent"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '8 Domestic + 4 International lounge visits/year',
    true,
    ARRAY['reliance'],
    true,
    ARRAY['20X on AJIO/JioMart (5% effective value)','8 domestic + 4 international lounge visits','10X on all Reliance brands'],
    ARRAY['No UPI cashback','1 RP = ₹0.25','High ₹2,999 fee for ecosystem-locked card']
),
-- ─────────────────────────────────────────────────────────────────
-- 23. LANDMARK REWARDS SBI CARD
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-landmark', 'SBI Card', 'Landmark Rewards SBI Card',
    499, 'None', 499, 'Visa', 'entry',
    '[{"type":"points","rate":10,"merchant":"Lifestyle, Home Centre, Max, Spar"},{"type":"points","rate":5,"merchant":"Dining, Movies"},{"type":"points","rate":1,"merchant":"All other spends"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.25,"spend_divisor":100,"default_rate":1,"categories":[{"keywords":["lifestyle","home centre","max","spar"],"rate":10},{"keywords":["dining","movies"],"rate":5}]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'None',
    true,
    ARRAY['landmark-stores'],
    true,
    ARRAY['10X on Lifestyle/Home Centre/Max/Spar','5X on dining and movies'],
    ARRAY['No annual fee waiver at any spend level','No lounge access','1 RP = ₹0.25']
),
-- ─────────────────────────────────────────────────────────────────
-- 24. LANDMARK REWARDS SBI CARD SELECT
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-landmark-select', 'SBI Card', 'Landmark Rewards SBI Card SELECT',
    1499, 'None', 1499, 'Visa', 'mid',
    '[{"type":"points","rate":15,"merchant":"Lifestyle, Home Centre, Max, Spar"},{"type":"points","rate":10,"merchant":"Dining, Movies"},{"type":"points","rate":2,"merchant":"All other spends"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.25,"spend_divisor":100,"default_rate":2,"categories":[{"keywords":["lifestyle","home centre","max","spar"],"rate":15},{"keywords":["dining","movies"],"rate":10}]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'None',
    true,
    ARRAY['landmark-stores'],
    true,
    ARRAY['15X on Lifestyle/Max/Spar','10X on dining and movies','Higher base earn rate vs entry'],
    ARRAY['No annual fee waiver option','No lounge access','1 RP = ₹0.25']
),
-- ─────────────────────────────────────────────────────────────────
-- 25. LANDMARK REWARDS SBI CARD PRIME
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-landmark-prime', 'SBI Card', 'Landmark Rewards SBI Card PRIME',
    2999, 'None', 2999, 'Visa', 'premium',
    '[{"type":"points","rate":25,"merchant":"Lifestyle, Home Centre, Max, Spar"},{"type":"points","rate":10,"merchant":"Dining, Movies"},{"type":"points","rate":2,"merchant":"All other spends"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.25,"spend_divisor":100,"default_rate":2,"categories":[{"keywords":["lifestyle","home centre","max","spar"],"rate":25},{"keywords":["dining","movies"],"rate":10}]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '8 Domestic + 4 International lounge visits/year',
    true,
    ARRAY['landmark-stores'],
    true,
    ARRAY['25X on Lifestyle/Max/Spar (6.25% effective value)','10X on dining and movies','8 domestic + 4 international lounge visits'],
    ARRAY['No annual fee waiver option','Ecosystem-locked for max value','1 RP = ₹0.25']
),
-- ─────────────────────────────────────────────────────────────────
-- 26. TITAN SBI CARD
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-titan', 'SBI Card', 'Titan SBI Card',
    2999, 'Waived on ₹3,00,000 annual spend', 2999, 'Visa', 'premium',
    '[{"type":"cashback","rate":7.5,"merchant":"Titan, Helios"},{"type":"cashback","rate":5,"merchant":"Mia, CaratLane"},{"type":"cashback","rate":3,"merchant":"Tanishq"},{"type":"points","rate":6,"merchant":"All other spends per ₹100"}]'::jsonb,
    '{"type":"mixed","point_value_rupees":0.25,"spend_divisor":100,"default_rate":6,"categories":[{"keywords":["titan","helios"],"cashback_rate":0.075},{"keywords":["mia","caratlane"],"cashback_rate":0.05},{"keywords":["tanishq"],"cashback_rate":0.03}],"exclusions":["fuel","wallet","emi"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '8 Domestic + 4 International lounge visits/year',
    true,
    ARRAY['jewelry','titan'],
    true,
    ARRAY['7.5% cashback on Titan and Helios','5% on Mia and CaratLane','3% on Tanishq','8 domestic + 4 international lounge visits'],
    ARRAY['Highly niche — best value only on Titan group brands','₹3L fee waiver condition']
),
-- ─────────────────────────────────────────────────────────────────
-- 27. APOLLO SBI CARD SELECT
-- ─────────────────────────────────────────────────────────────────
(
    'sbi-apollo-select', 'SBI Card', 'Apollo SBI Card SELECT',
    1499, 'Waived on ₹3,00,000 annual spend', 1499, 'Visa', 'mid',
    '[{"type":"points","rate":10,"merchant":"Apollo 24x7, Apollo Pharmacy"},{"type":"points","rate":2,"merchant":"Dining, Travel"},{"type":"points","rate":0.5,"merchant":"All other spends"}]'::jsonb,
    '{"type":"points","point_value_rupees":1.0,"spend_divisor":100,"default_rate":0.5,"categories":[{"keywords":["apollo","pharmacy","apollo 247","apollomedics"],"rate":10},{"keywords":["dining","travel","restaurant"],"rate":2}],"exclusions":["fuel","wallet","cash_advance"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":500,"fee":0},{"min":501,"max":1000,"fee":400},{"min":1001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":950},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '4 Domestic lounge visits/year',
    true,
    ARRAY['health','pharmacy'],
    true,
    ARRAY['10% reward value on Apollo 24x7 and pharmacy (1 RP = ₹1)','Complimentary Apollo 247 Circle membership','4 domestic lounge visits'],
    ARRAY['Very high ₹3L fee waiver for a ₹1,499 card','Only 0.5% base earn rate on non-Apollo spends','Niche health-focused card']
);
 
COMMIT;

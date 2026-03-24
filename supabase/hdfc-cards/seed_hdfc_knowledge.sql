BEGIN;

-- 1. Ensure the deterministic math column exists
ALTER TABLE knowledge_credit_cards ADD COLUMN IF NOT EXISTS reward_math JSONB;
ALTER TABLE knowledge_credit_cards ADD COLUMN IF NOT EXISTS penalties JSONB;

-- 2. Remove any existing HDFC cards to prevent duplicates
DELETE FROM knowledge_credit_cards WHERE bank = 'HDFC Bank';

-- 3. Insert all verified HDFC Bank Credit Cards with Math Engine + Penalties
INSERT INTO knowledge_credit_cards (
    id, bank, name, annual_fee, fee_waiver, joining_fee, network, tier,
    rewards, reward_math, penalties, lounge_access, fuel_surcharge_waiver, best_for, is_active, pros, cons
) VALUES

-- ═══════════════════════════════════════════════════════
-- 1. HDFC MILLENNIA
-- ═══════════════════════════════════════════════════════
(
    'hdfc-millennia', 'HDFC Bank', 'Millennia Credit Card', 1000, 'Waived on ₹1,00,000 spend', 1000, 'Visa', 'mid',
    '[{"type": "cashback", "rate": 5, "merchant": "Amazon, Flipkart, Myntra, Swiggy, Zomato, BookMyShow"}, {"type": "cashback", "rate": 1, "merchant": "All other spends"}]'::jsonb,
    '{"type": "cashback", "default_rate": 0.01, "categories": [{"keywords": ["amazon", "flipkart", "myntra", "swiggy", "zomato", "bookmyshow", "cultfit", "sonyliv", "tatacliq", "uber"], "rate": 0.05, "max_cap_points_monthly": 1000}], "exclusions": ["fuel", "wallet", "rent", "emi"]}'::jsonb,
    '{"apr_monthly": 3.75, "interest_free_period_days": 50, "forex_markup_percent": 3.5, "late_fees": [{"min": 0, "max": 100, "fee": 0}, {"min": 101, "max": 500, "fee": 100}, {"min": 501, "max": 1000, "fee": 500}, {"min": 1001, "max": 5000, "fee": 600}, {"min": 5001, "max": 10000, "fee": 750}, {"min": 10001, "max": 25000, "fee": 900}, {"min": 25001, "max": 50000, "fee": 1100}, {"min": 50001, "max": 99999999, "fee": 1300}]}'::jsonb,
    '4 Domestic Lounge visits/year', true, ARRAY['online-shopping', 'millennials'], true,
    ARRAY['5% cashback on Amazon/Flipkart/Swiggy', '₹1000 voucher on ₹1L quarterly spend'],
    ARRAY['Cashback capped at 1000 CashPoints/month on 5% tier', 'Only ₹0.30/pt if not redeemed on statement']
),

-- ═══════════════════════════════════════════════════════
-- 2. HDFC MONEYBACK+
-- ═══════════════════════════════════════════════════════
(
    'hdfc-moneyback-plus', 'HDFC Bank', 'MoneyBack+ Credit Card', 500, 'Waived on ₹50,000 spend', 500, 'Visa', 'entry',
    '[{"type": "points", "rate": 10, "merchant": "Amazon, Flipkart, Swiggy, BigBasket, Reliance Smart"}, {"type": "points", "rate": 1, "merchant": "All other"}]'::jsonb,
    '{"type": "points", "point_value_rupees": 0.25, "spend_divisor": 150, "default_rate": 2, "categories": [{"keywords": ["amazon", "flipkart", "swiggy", "bigbasket", "reliance"], "rate": 20, "max_cap_points_monthly": 2500}], "exclusions": ["fuel", "wallet", "rent"]}'::jsonb,
    '{"apr_monthly": 3.75, "interest_free_period_days": 50, "forex_markup_percent": 3.5, "late_fees": [{"min": 0, "max": 100, "fee": 0}, {"min": 101, "max": 500, "fee": 100}, {"min": 501, "max": 1000, "fee": 500}, {"min": 1001, "max": 5000, "fee": 600}, {"min": 5001, "max": 10000, "fee": 750}, {"min": 10001, "max": 25000, "fee": 900}, {"min": 25001, "max": 50000, "fee": 1100}, {"min": 50001, "max": 99999999, "fee": 1300}]}'::jsonb,
    'None', true, ARRAY['online-shopping', 'no-fee'], true,
    ARRAY['10X points on Amazon/Flipkart/Swiggy', 'Low annual fee'],
    ARRAY['Points capped at 2500/month on 10X tier', 'Low base point value ₹0.25']
),

-- ═══════════════════════════════════════════════════════
-- 3. HDFC SWIGGY
-- ═══════════════════════════════════════════════════════
(
    'hdfc-swiggy', 'HDFC Bank', 'Swiggy HDFC Credit Card', 500, 'Waived on ₹2,00,000 spend', 500, 'Visa', 'mid',
    '[{"type": "cashback", "rate": 10, "merchant": "Swiggy"}, {"type": "cashback", "rate": 5, "merchant": "Online"}, {"type": "cashback", "rate": 1, "merchant": "Offline"}]'::jsonb,
    '{"type": "cashback", "default_rate": 0.01, "categories": [{"keywords": ["swiggy", "instamart", "dineout", "genie"], "rate": 0.10, "max_cap_points_monthly": 1500}, {"keywords": ["online", "flipkart", "amazon", "meesho", "ajio", "myntra", "electronics", "pharmacy"], "rate": 0.05, "max_cap_points_monthly": 1500}], "exclusions": ["fuel", "rent", "emi", "wallet", "jewelry"]}'::jsonb,
    '{"apr_monthly": 3.75, "interest_free_period_days": 50, "forex_markup_percent": 3.5, "late_fees": [{"min": 0, "max": 100, "fee": 0}, {"min": 101, "max": 500, "fee": 100}, {"min": 501, "max": 1000, "fee": 500}, {"min": 1001, "max": 5000, "fee": 600}, {"min": 5001, "max": 10000, "fee": 750}, {"min": 10001, "max": 25000, "fee": 900}, {"min": 25001, "max": 50000, "fee": 1100}, {"min": 50001, "max": 99999999, "fee": 1300}]}'::jsonb,
    'None', true, ARRAY['food-delivery', 'swiggy-users', 'online-shopping'], true,
    ARRAY['10% cashback on Swiggy app', '5% on all online', 'Max ₹3500/month total cashback'],
    ARRAY['₹1500 cap per category', 'Swiggy Wallet/Minis/Liquor excluded']
),

-- ═══════════════════════════════════════════════════════
-- 4. HDFC REGALIA GOLD
-- ═══════════════════════════════════════════════════════
(
    'hdfc-regalia-gold', 'HDFC Bank', 'Regalia Gold Credit Card', 2500, 'Waived on ₹3,00,000 spend', 2500, 'Visa', 'premium',
    '[{"type": "points", "rate": 4, "merchant": "General per ₹150"}, {"type": "points", "rate": 20, "merchant": "Myntra, Nykaa, Reliance Digital, M&S"}]'::jsonb,
    '{"type": "points", "point_value_rupees": 1.0, "spend_divisor": 150, "default_rate": 4, "categories": [{"keywords": ["myntra", "nykaa", "reliance digital", "marks and spencer"], "rate": 20, "max_cap_points_monthly": 5000}, {"keywords": ["smartbuy", "hotel"], "rate": 40, "max_cap_points_monthly": 4000}, {"keywords": ["smartbuy", "flight"], "rate": 20, "max_cap_points_monthly": 4000}], "exclusions": ["fuel", "wallet", "rent", "tax"]}'::jsonb,
    '{"apr_monthly": 3.75, "interest_free_period_days": 50, "forex_markup_percent": 2.0, "late_fees": [{"min": 0, "max": 100, "fee": 0}, {"min": 101, "max": 500, "fee": 100}, {"min": 501, "max": 1000, "fee": 500}, {"min": 1001, "max": 5000, "fee": 600}, {"min": 5001, "max": 10000, "fee": 750}, {"min": 10001, "max": 25000, "fee": 900}, {"min": 25001, "max": 50000, "fee": 1100}, {"min": 50001, "max": 99999999, "fee": 1300}]}'::jsonb,
    '12 Domestic Lounge visits/year', true, ARRAY['online-shopping', 'travel', 'premium-lifestyle'], true,
    ARRAY['5X on Myntra/Nykaa/Reliance Digital', '10X on SmartBuy hotels', 'Club Vistara Silver on milestone'],
    ARRAY['Points cap on accelerated brands', 'SmartBuy daily cap of 2000 pts']
),

-- ═══════════════════════════════════════════════════════
-- 5. HDFC DINERS CLUB BLACK (NEW APPLICATIONS CLOSED)
-- ═══════════════════════════════════════════════════════
(
    'hdfc-diners-black', 'HDFC Bank', 'Diners Club Black Credit Card', 10000, 'Waived on ₹5,00,000 spend', 10000, 'Diners', 'super-premium',
    '[{"type": "points", "rate": 5, "merchant": "General per ₹150"}, {"type": "points", "rate": 10, "merchant": "SmartBuy"}]'::jsonb,
    '{"type": "points", "point_value_rupees": 1.0, "spend_divisor": 150, "default_rate": 5, "categories": [{"keywords": ["smartbuy", "hotel", "pharmeasy"], "rate": 50, "max_cap_points_monthly": 15000}, {"keywords": ["smartbuy", "flight", "myntra", "gyftr"], "rate": 25, "max_cap_points_monthly": 15000}], "exclusions": ["fuel", "wallet", "rent", "insurance"]}'::jsonb,
    '{"apr_monthly": 1.99, "interest_free_period_days": 50, "forex_markup_percent": 2.0, "late_fees": [{"min": 0, "max": 100, "fee": 0}, {"min": 101, "max": 500, "fee": 100}, {"min": 501, "max": 1000, "fee": 500}, {"min": 1001, "max": 5000, "fee": 600}, {"min": 5001, "max": 10000, "fee": 750}, {"min": 10001, "max": 25000, "fee": 900}, {"min": 25001, "max": 50000, "fee": 1100}, {"min": 50001, "max": 99999999, "fee": 1300}]}'::jsonb,
    'Unlimited Domestic + International lounges', true, ARRAY['travel', 'high-spenders', 'everything'], false,
    ARRAY['3.33% base reward rate', '10X on SmartBuy = 33% value back!', 'Unlimited lounge access worldwide'],
    ARRAY['NEW APPLICATIONS CLOSED — HDFC.com: "We are currently not accepting new applications". Existing holders unaffected.', 'Diners Club not universally accepted']
),

-- ═══════════════════════════════════════════════════════
-- 6. HDFC INFINIA (CLASSIC)
-- ═══════════════════════════════════════════════════════
(
    'hdfc-infinia', 'HDFC Bank', 'Infinia Credit Card', 10000, 'Waived on ₹8,00,000 annual spend', 10000, 'Visa', 'super-premium',
    '[{"type":"points","rate":5,"merchant":"All retail per ₹150"},{"type":"points","rate":50,"merchant":"SmartBuy Hotels, Pharmeasy"},{"type":"points","rate":25,"merchant":"SmartBuy Flights, Myntra, Gyftr, Bus"}]'::jsonb,
    '{"type":"points","point_value_rupees":1.0,"spend_divisor":150,"default_rate":5,"categories":[{"keywords":["smartbuy","hotel","pharmeasy"],"rate":50,"max_cap_points_monthly":15000},{"keywords":["smartbuy","flight","myntra","gyftr","bus"],"rate":25,"max_cap_points_monthly":15000}],"exclusions":["fuel","wallet","rent","insurance"]}'::jsonb,
    '{"apr_monthly":1.99,"interest_free_period_days":50,"forex_markup_percent":2.0,"late_fees":[{"min":0,"max":100,"fee":0},{"min":101,"max":500,"fee":100},{"min":501,"max":1000,"fee":500},{"min":1001,"max":5000,"fee":600},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":900},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'Unlimited Domestic + International lounges (Priority Pass, 1000+ worldwide)', true, ARRAY['everything','high-spenders','travel'], true,
    ARRAY['3.33% base reward rate','SmartBuy Hotels 50X = 33% value back','Unlimited lounge worldwide','Low 2% forex','1.99% APR','Fee waiver at ₹8L'],
    ARRAY['Invite-only card','₹10,000 fee','SmartBuy cap 15,000 pts/month']
),

-- ═══════════════════════════════════════════════════════
-- 7. HDFC INFINIA METAL EDITION
-- ═══════════════════════════════════════════════════════
(
    'hdfc-infinia-metal', 'HDFC Bank', 'Infinia Metal Edition Credit Card', 12500, 'Waived on ₹10,00,000 annual spend', 12500, 'Visa', 'super-premium',
    '[{"type":"points","rate":5,"merchant":"All retail per ₹150"},{"type":"points","rate":50,"merchant":"SmartBuy Hotels, Pharmeasy"},{"type":"points","rate":25,"merchant":"SmartBuy Flights, Myntra, Gyftr, Bus"}]'::jsonb,
    '{"type":"points","point_value_rupees":1.0,"spend_divisor":150,"default_rate":5,"categories":[{"keywords":["smartbuy","hotel","pharmeasy"],"rate":50,"max_cap_points_monthly":15000},{"keywords":["smartbuy","flight","myntra","gyftr","bus"],"rate":25,"max_cap_points_monthly":15000}],"exclusions":["fuel","wallet","rent","insurance"]}'::jsonb,
    '{"apr_monthly":1.99,"interest_free_period_days":50,"forex_markup_percent":2.0,"late_fees":[{"min":0,"max":100,"fee":0},{"min":101,"max":500,"fee":100},{"min":501,"max":1000,"fee":500},{"min":1001,"max":5000,"fee":600},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":900},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'Unlimited Domestic + International lounges (Priority Pass)', true, ARRAY['everything','high-spenders','travel'], true,
    ARRAY['3.33% base reward rate','Metal card build quality','Unlimited lounge worldwide','Low 2% forex','1.99% APR','Fee waiver at ₹10L'],
    ARRAY['Invite-only card','₹12,500 fee (higher bar than classic)','SmartBuy cap 15,000 pts/month']
),

-- ═══════════════════════════════════════════════════════
-- 8. HDFC INDIANOIL
-- ═══════════════════════════════════════════════════════
(
    'hdfc-indianoil', 'HDFC Bank', 'IndianOil HDFC Credit Card', 500, 'Waived on ₹50,000 spend', 500, 'Visa', 'entry',
    '[{"type": "points", "rate": 5, "merchant": "IndianOil fuel"}, {"type": "points", "rate": 5, "merchant": "Grocery, Bills"}]'::jsonb,
    '{"type": "points", "point_value_rupees": 0.96, "spend_divisor": 150, "default_rate": 1, "categories": [{"keywords": ["indianoil", "fuel", "petrol", "diesel"], "rate": 5, "max_cap_points_monthly": 150}, {"keywords": ["grocery", "bills", "recharge"], "rate": 5, "max_cap_points_monthly": 100}], "exclusions": ["wallet", "rent", "emi"]}'::jsonb,
    '{"apr_monthly": 3.75, "interest_free_period_days": 50, "forex_markup_percent": 3.5, "late_fees": [{"min": 0, "max": 100, "fee": 0}, {"min": 101, "max": 500, "fee": 100}, {"min": 501, "max": 1000, "fee": 500}, {"min": 1001, "max": 5000, "fee": 600}, {"min": 5001, "max": 10000, "fee": 750}, {"min": 10001, "max": 25000, "fee": 900}, {"min": 25001, "max": 50000, "fee": 1100}, {"min": 50001, "max": 99999999, "fee": 1300}]}'::jsonb,
    'None', true, ARRAY['fuel', 'indianoil'], true,
    ARRAY['Up to 50 litres free fuel/year', '1% surcharge waiver', 'Very low fee waiver target'],
    ARRAY['Only useful at IndianOil', 'Points expire in 2 years']
),

-- ═══════════════════════════════════════════════════════
-- 9. HDFC MARRIOTT BONVOY
-- ═══════════════════════════════════════════════════════
(
    'hdfc-marriott-bonvoy', 'HDFC Bank', 'Marriott Bonvoy HDFC Credit Card', 3000, 'Waived on ₹3,00,000 spend', 3000, 'Visa', 'premium',
    '[{"type": "points", "rate": 8, "merchant": "Marriott Hotels"}, {"type": "points", "rate": 4, "merchant": "Travel, Dining"}, {"type": "points", "rate": 2, "merchant": "Other"}]'::jsonb,
    '{"type": "points", "point_value_rupees": 0.50, "spend_divisor": 150, "default_rate": 2, "categories": [{"keywords": ["marriott", "hotel", "sheraton", "westin", "w hotel", "le meridien"], "rate": 8}, {"keywords": ["travel", "flight", "dining", "entertainment", "restaurant"], "rate": 4}], "exclusions": ["fuel", "wallet", "rent"]}'::jsonb,
    '{"apr_monthly": 3.75, "interest_free_period_days": 50, "forex_markup_percent": 3.5, "late_fees": [{"min": 0, "max": 100, "fee": 0}, {"min": 101, "max": 500, "fee": 100}, {"min": 501, "max": 1000, "fee": 500}, {"min": 1001, "max": 5000, "fee": 600}, {"min": 5001, "max": 10000, "fee": 750}, {"min": 10001, "max": 25000, "fee": 900}, {"min": 25001, "max": 50000, "fee": 1100}, {"min": 50001, "max": 99999999, "fee": 1300}]}'::jsonb,
    '12 Domestic + 12 International lounge visits/year', true, ARRAY['travel', 'hotels', 'marriott'], true,
    ARRAY['8 Bonvoy pts/₹150 at Marriott', 'Free night awards', 'Complimentary Silver Elite Status'],
    ARRAY['Point value only ≈₹0.50', 'Best value only at Marriott stays']
),

-- ═══════════════════════════════════════════════════════
-- 10. HDFC TATA NEU INFINITY
-- ═══════════════════════════════════════════════════════
(
    'hdfc-tata-neu-infinity', 'HDFC Bank', 'Tata Neu Infinity HDFC Credit Card', 1499, 'Waived on ₹3,00,000 spend', 1499, 'RuPay', 'premium',
    '[{"type": "neucoins", "rate": 10, "merchant": "Tata Brands"}, {"type": "neucoins", "rate": 1.5, "merchant": "Other"}]'::jsonb,
    '{"type": "cashback", "default_rate": 0.015, "categories": [{"keywords": ["tata", "bigbasket", "croma", "1mg", "taj", "westside", "tanishq", "titan", "air india", "cultfit", "tataplay"], "rate": 0.10, "max_cap_points_monthly": 2000}, {"keywords": ["upi", "qr", "bhim"], "rate": 0.015, "max_cap_points_monthly": 500}], "exclusions": ["fuel", "wallet", "rent", "emi"]}'::jsonb,
    '{"apr_monthly": 3.75, "interest_free_period_days": 50, "forex_markup_percent": 3.5, "late_fees": [{"min": 0, "max": 100, "fee": 0}, {"min": 101, "max": 500, "fee": 100}, {"min": 501, "max": 1000, "fee": 500}, {"min": 1001, "max": 5000, "fee": 600}, {"min": 5001, "max": 10000, "fee": 750}, {"min": 10001, "max": 25000, "fee": 900}, {"min": 25001, "max": 50000, "fee": 1100}, {"min": 50001, "max": 99999999, "fee": 1300}]}'::jsonb,
    '8 Domestic, 4 International lounges/year', true, ARRAY['tata-brands', 'upi', 'groceries'], true,
    ARRAY['10% back on entire Tata ecosystem', '1.5% on UPI via RuPay', 'NeuCoins = ₹1 each'],
    ARRAY['NeuCoins locked to Tata brands', 'UPI cap 500 NC/month']
),

-- ═══════════════════════════════════════════════════════
-- 11. HDFC TATA NEU PLUS
-- ═══════════════════════════════════════════════════════
(
    'hdfc-tata-neu-plus', 'HDFC Bank', 'Tata Neu Plus HDFC Credit Card', 499, 'Waived on ₹50,000 spend', 499, 'RuPay', 'entry',
    '[{"type": "neucoins", "rate": 5, "merchant": "Tata Brands"}, {"type": "neucoins", "rate": 1, "merchant": "Other"}]'::jsonb,
    '{"type": "cashback", "default_rate": 0.01, "categories": [{"keywords": ["tata", "bigbasket", "croma", "1mg", "westside", "tanishq", "titan"], "rate": 0.05, "max_cap_points_monthly": 1000}, {"keywords": ["upi", "qr"], "rate": 0.005, "max_cap_points_monthly": 250}], "exclusions": ["fuel", "wallet", "rent", "emi"]}'::jsonb,
    '{"apr_monthly": 3.75, "interest_free_period_days": 50, "forex_markup_percent": 3.5, "late_fees": [{"min": 0, "max": 100, "fee": 0}, {"min": 101, "max": 500, "fee": 100}, {"min": 501, "max": 1000, "fee": 500}, {"min": 1001, "max": 5000, "fee": 600}, {"min": 5001, "max": 10000, "fee": 750}, {"min": 10001, "max": 25000, "fee": 900}, {"min": 25001, "max": 50000, "fee": 1100}, {"min": 50001, "max": 99999999, "fee": 1300}]}'::jsonb,
    '4 Domestic lounges/year', true, ARRAY['tata-brands', 'upi'], true,
    ARRAY['5% on Tata brands', 'Very low ₹50K fee waiver', 'UPI rewards via RuPay'],
    ARRAY['Only 0.5% on UPI', 'Lower earn rate than Infinity']
),

-- ═══════════════════════════════════════════════════════
-- 12. HDFC FREEDOM
-- ═══════════════════════════════════════════════════════
(
    'hdfc-freedom', 'HDFC Bank', 'Freedom Credit Card', 500, 'Waived on ₹50,000 spend', 500, 'Visa', 'entry',
    '[{"type": "cashback", "rate": 5, "merchant": "Dining, Railway"}, {"type": "cashback", "rate": 1, "merchant": "Other"}]'::jsonb,
    '{"type": "points", "point_value_rupees": 0.50, "spend_divisor": 150, "default_rate": 2, "categories": [{"keywords": ["dining", "restaurant", "railway", "irctc", "telecom", "recharge"], "rate": 10, "max_cap_points_monthly": 2000}], "exclusions": ["fuel", "wallet", "rent"]}'::jsonb,
    '{"apr_monthly": 3.75, "interest_free_period_days": 50, "forex_markup_percent": 3.5, "late_fees": [{"min": 0, "max": 100, "fee": 0}, {"min": 101, "max": 500, "fee": 100}, {"min": 501, "max": 1000, "fee": 500}, {"min": 1001, "max": 5000, "fee": 600}, {"min": 5001, "max": 10000, "fee": 750}, {"min": 10001, "max": 25000, "fee": 900}, {"min": 25001, "max": 50000, "fee": 1100}, {"min": 50001, "max": 99999999, "fee": 1300}]}'::jsonb,
    'None', true, ARRAY['dining', 'railway', 'entry-level'], true,
    ARRAY['5X on dining and railway', 'Low fee', 'Easy approval'],
    ARRAY['Low point value', 'Basic card']
),

-- ═══════════════════════════════════════════════════════
-- 13. IRCTC HDFC BANK CREDIT CARD
-- ═══════════════════════════════════════════════════════
(
    'hdfc-irctc', 'HDFC Bank', 'IRCTC HDFC Bank Credit Card', 500, 'Waived on ₹1,50,000 annual spend', 500, 'RuPay', 'entry',
    '[{"type":"points","rate":5,"merchant":"IRCTC website + Rail Connect App (per ₹100)"},{"type":"points","rate":1,"merchant":"Other spends (per ₹100)"}]'::jsonb,
    '{"type":"points","point_value_rupees":1.0,"spend_divisor":100,"default_rate":1,"categories":[{"keywords":["irctc","rail connect","irctc.co.in"],"rate":5,"max_cap_points_monthly":1000,"max_cap_points_annually":12000}],"exclusions":["fuel","wallet","emi","rent","government"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":100,"fee":0},{"min":101,"max":500,"fee":100},{"min":501,"max":1000,"fee":500},{"min":1001,"max":5000,"fee":600},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":900},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '8 IRCTC Executive Railway Station Lounge visits/year (2/quarter)', true, ARRAY['railway','irctc','travel'], true,
    ARRAY['5% value return on IRCTC train bookings','Additional 5% SmartBuy IRCTC cashback','RuPay UPI enabled'],
    ARRAY['Redeemable ONLY for IRCTC tickets via SmartBuy','₹99 redemption fee']
),

-- ═══════════════════════════════════════════════════════
-- 14. SHOPPERS STOP HDFC BANK CREDIT CARD
-- ═══════════════════════════════════════════════════════
(
    'hdfc-shoppers-stop', 'HDFC Bank', 'Shoppers Stop HDFC Bank Credit Card', 299, 'None (may be LTF for select customers)', 299, 'Visa', 'entry',
    '[{"type":"first_citizen_points","rate":6,"merchant":"Shoppers Stop Private Brand"},{"type":"first_citizen_points","rate":2,"merchant":"Other Shoppers Stop brands + all other retail"}]'::jsonb,
    '{"type":"first_citizen_points","default_rate":2,"categories":[{"keywords":["shoppers stop","private label","ss private"],"rate":6,"max_cap_points_monthly":500}],"exclusions":["fuel","wallet","rent","government"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":100,"fee":0},{"min":101,"max":500,"fee":100},{"min":501,"max":1000,"fee":500},{"min":1001,"max":5000,"fee":600},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":900},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'None', true, ARRAY['shoppers-stop','retail'], true,
    ARRAY['Low ₹299 fee','Complimentary First Citizen membership','RuPay variant available for UPI'],
    ARRAY['Points locked to Shoppers Stop']
),

-- ═══════════════════════════════════════════════════════
-- 15. SHOPPERS STOP BLACK HDFC BANK CREDIT CARD
-- ═══════════════════════════════════════════════════════
(
    'hdfc-shoppers-stop-black', 'HDFC Bank', 'Shoppers Stop Black HDFC Bank Credit Card', 4500, 'Waived on ₹50,000 spend', 4500, 'Visa', 'premium',
    '[{"type":"first_citizen_points","rate":20,"merchant":"Shoppers Stop Private Brand"},{"type":"first_citizen_points","rate":15,"merchant":"Other Shoppers Stop brands"},{"type":"first_citizen_points","rate":5,"merchant":"All other retail"}]'::jsonb,
    '{"type":"first_citizen_points","default_rate":5,"categories":[{"keywords":["shoppers stop private","ss exclusive"],"rate":20},{"keywords":["shoppers stop"],"rate":15}],"exclusions":["fuel","wallet","rent","government"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":100,"fee":0},{"min":101,"max":500,"fee":100},{"min":501,"max":1000,"fee":500},{"min":1001,"max":5000,"fee":600},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":900},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '16 Domestic (4/qtr), 8 International (2/qtr) lounge visits/year', true, ARRAY['shoppers-stop','premium-retail'], true,
    ARRAY['13.3% back on Private Brands (20 FCP/150)','Complimentary First Citizen Black Membership','Low waiver target (50k) for premium card','Accidental Air Death Cover ₹3Cr'],
    ARRAY['₹4500 fee','Points locked to Shoppers Stop ecosystem']
),

-- ═══════════════════════════════════════════════════════
-- 16. PHONEPE HDFC BANK UNO CREDIT CARD
-- ═══════════════════════════════════════════════════════
(
    'hdfc-phonepe-uno', 'HDFC Bank', 'PhonePe HDFC Bank Uno Credit Card', 499, 'Waived on ₹1,00,000 annual spend', 499, 'RuPay', 'entry',
    '[{"type":"points","rate":2,"merchant":"PhonePe Recharges, Bill, Travel"},{"type":"points","rate":1,"merchant":"UPI Scan & Pay / Online"}]'::jsonb,
    '{"type":"points","point_value_rupees":1.0,"default_rate":1,"categories":[{"keywords":["recharge","utility","bill","travel","phonepe"],"rate":2,"max_cap_points_monthly":500}],"exclusions":["fuel","wallet","emi","cash_advance","government","rental"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":100,"fee":0},{"min":101,"max":500,"fee":100},{"min":501,"max":1000,"fee":500},{"min":1001,"max":5000,"fee":600},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":900},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'None', true, ARRAY['upi','phonepe'], true,
    ARRAY['UPI rewards via RuPay','2% on PhonePe categories'],
    ARRAY['Only available via PhonePe app','Caps at 500 pts/month']
),

-- ═══════════════════════════════════════════════════════
-- 17. PHONEPE HDFC BANK ULTIMO CREDIT CARD
-- ═══════════════════════════════════════════════════════
(
    'hdfc-phonepe-ultimo', 'HDFC Bank', 'PhonePe HDFC Bank Ultimo Credit Card', 999, 'Waived on ₹2,00,000 annual spend', 999, 'RuPay', 'mid',
    '[{"type":"points","rate":10,"merchant":"PhonePe Recharges, Bill, Travel"},{"type":"points","rate":2,"merchant":"UPI Scan & Pay / Online"}]'::jsonb,
    '{"type":"points","point_value_rupees":1.0,"default_rate":1,"categories":[{"keywords":["recharge","utility","bill","travel","phonepe"],"rate":10,"max_cap_points_monthly":1000},{"keywords":["upi","online"],"rate":2}],"exclusions":["fuel","wallet","emi","cash_advance","government","rental"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":100,"fee":0},{"min":101,"max":500,"fee":100},{"min":501,"max":1000,"fee":500},{"min":1001,"max":5000,"fee":600},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":900},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '8 Domestic lounge visits/year (requires ₹75k quarterly spend)', true, ARRAY['upi','phonepe'], true,
    ARRAY['10% reward on PhonePe categories','Cashback straight to statement'],
    ARRAY['Only available via PhonePe app','Capped at 1000 pts/month']
),

-- ═══════════════════════════════════════════════════════
-- 18. HDFC BANK UPI RUPAY CREDIT CARD
-- ═══════════════════════════════════════════════════════
(
    'hdfc-upi-rupay', 'HDFC Bank', 'HDFC Bank UPI RuPay Credit Card', 0, 'No standalone fee', 0, 'RuPay', 'entry',
    '[{"type":"cashpoints","rate":3,"merchant":"Groceries, Dining, PayZapp"},{"type":"cashpoints","rate":2,"merchant":"Utility spends"},{"type":"cashpoints","rate":1,"merchant":"All other spends"}]'::jsonb,
    '{"type":"cashpoints","cashpoint_value_rupees":0.25,"default_rate":1,"categories":[{"keywords":["grocery","dining","payzapp"],"rate":3,"max_cap_points_monthly":500},{"keywords":["utility","bills"],"rate":2,"max_cap_points_monthly":500}],"exclusions":["fuel","rent","wallet","emi","government"]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[]}'::jsonb,
    'None', false, ARRAY['upi','add-on'], true,
    ARRAY['Free add-on card for UPI','3% CashPoints on groceries'],
    ARRAY['Rewards are low value (₹0.25/pt)']
),

-- ═══════════════════════════════════════════════════════
-- 19. H.O.G. DINERS CLUB CREDIT CARD
-- ═══════════════════════════════════════════════════════
(
    'hdfc-hog-diners', 'HDFC Bank', 'H.O.G. Diners Club Credit Card', 10000, 'Waived on ₹5,00,000 annual spend', 10000, 'Diners', 'super-premium',
    '[{"type":"points","rate":5,"merchant":"All retail per ₹150"}]'::jsonb,
    '{"type":"points","point_value_rupees":1.0,"spend_divisor":150,"default_rate":5,"note":"Tied to Harley-Davidson Owners Group"}'::jsonb,
    '{"apr_monthly":1.99,"interest_free_period_days":50,"forex_markup_percent":2.0,"late_fees":[{"min":0,"max":100,"fee":0},{"min":101,"max":500,"fee":100},{"min":501,"max":1000,"fee":500},{"min":1001,"max":5000,"fee":600},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":900},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'Unlimited Domestic + International lounges', true, ARRAY['harley-davidson','lifestyle'], true,
    ARRAY['Super premium 1.99% APR and 2% Forex','1 RP = ₹1'],
    ARRAY['₹10k fee']
),

-- ═══════════════════════════════════════════════════════
-- 20. BIZFIRST CREDIT CARD
-- ═══════════════════════════════════════════════════════
(
    'hdfc-bizfirst', 'HDFC Bank', 'BizFirst Credit Card', 500, 'Waived on ₹50,000 annual spend', 500, 'Visa', 'entry',
    '[{"type":"points","rate":3,"merchant":"EMI (capped 1,000/mo)"},{"type":"points","rate":2,"merchant":"Utility, Electronics, Smartpay"},{"type":"points","rate":1,"merchant":"Other spends"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.15,"default_rate":1,"categories":[{"keywords":["emi"],"rate":3,"max_cap_points_monthly":1000},{"keywords":["utility","electronics","smartpay","payzapp"],"rate":2,"max_cap_points_monthly":500}],"exclusions":[]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":100,"fee":0},{"min":101,"max":500,"fee":100},{"min":501,"max":1000,"fee":500},{"min":1001,"max":5000,"fee":600},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":900},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'None', true, ARRAY['small-business','entry-level'], true,
    ARRAY['Low ₹500 fee','Low ₹50k waiver'],
    ARRAY['Low reward point value (₹0.15/pt)']
),

-- ═══════════════════════════════════════════════════════
-- 21. BIZGROW CREDIT CARD
-- ═══════════════════════════════════════════════════════
(
    'hdfc-bizgrow', 'HDFC Bank', 'BizGrow Credit Card', 500, 'Waived on ₹1,00,000 annual spend', 500, 'Visa', 'mid',
    '[{"type":"points","rate":20,"merchant":"GST, Utilities, Tax, MMT, Softwares (10X CashPoints)"},{"type":"points","rate":2,"merchant":"All other business spends per ₹150"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.25,"spend_divisor":150,"default_rate":2,"categories":[{"keywords":["gst","tax","income tax","smartpay","cleartax","dmart","aws","google","tally","azure"],"rate":20}],"exclusions":[]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":50,"forex_markup_percent":3.5,"late_fees":[{"min":0,"max":100,"fee":0},{"min":101,"max":500,"fee":100},{"min":501,"max":1000,"fee":500},{"min":1001,"max":5000,"fee":600},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":900},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'None', true, ARRAY['sme','business'], true,
    ARRAY['3.33% effective cashback on business overheads/software','10% off on Dineout'],
    ARRAY['Point value is ₹0.25']
),

-- ═══════════════════════════════════════════════════════
-- 22. BIZPOWER CREDIT CARD
-- ═══════════════════════════════════════════════════════
(
    'hdfc-bizpower', 'HDFC Bank', 'BizPower Credit Card', 2500, 'Waived on ₹4,00,000 annual spend', 2500, 'Visa', 'premium',
    '[{"type":"points","rate":20,"merchant":"Google Ads, Tax, SmartPay, Softwares (5X)"},{"type":"points","rate":4,"merchant":"All other business spends per ₹150"}]'::jsonb,
    '{"type":"points","point_value_rupees":0.65,"spend_divisor":150,"default_rate":4,"categories":[{"keywords":["google ads","reliance digital","tax","gst","income tax","smartpay","aws","tally","azure","office 365"],"rate":20}],"exclusions":[]}'::jsonb,
    '{"apr_monthly":3.75,"interest_free_period_days":55,"forex_markup_percent":2.0,"late_fees":[{"min":0,"max":100,"fee":0},{"min":101,"max":500,"fee":100},{"min":501,"max":1000,"fee":500},{"min":1001,"max":5000,"fee":600},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":900},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    '6 International (Priority Pass), 8 Domestic lounges/year', true, ARRAY['sme','business','premium'], true,
    ARRAY['55 day interest-free period','2% forex markup','High value redemption (up to ₹0.65/pt)'],
    ARRAY['₹2500 annual fee']
),

-- ═══════════════════════════════════════════════════════
-- 23. BIZBLACK METAL EDITION CREDIT CARD
-- ═══════════════════════════════════════════════════════
(
    'hdfc-bizblack-metal', 'HDFC Bank', 'BizBlack Metal Edition Credit Card', 10000, 'Waived on ₹7,50,000 annual spend', 10000, 'Mastercard', 'super-premium',
    '[{"type":"points","rate":25,"merchant":"MMT, Flipkart, Apple, Tax (5X per ₹150 capped)"},{"type":"points","rate":5,"merchant":"All other business spends per ₹150"}]'::jsonb,
    '{"type":"points","point_value_rupees":1.0,"spend_divisor":150,"default_rate":5,"categories":[{"keywords":["makemytrip","flipkart","apple","tax","gst"],"rate":25,"max_cap_points_monthly":7500}],"exclusions":[]}'::jsonb,
    '{"apr_monthly":1.99,"interest_free_period_days":50,"forex_markup_percent":2.0,"late_fees":[{"min":0,"max":100,"fee":0},{"min":101,"max":500,"fee":100},{"min":501,"max":1000,"fee":500},{"min":1001,"max":5000,"fee":600},{"min":5001,"max":10000,"fee":750},{"min":10001,"max":25000,"fee":900},{"min":25001,"max":50000,"fee":1100},{"min":50001,"max":99999999,"fee":1300}]}'::jsonb,
    'Unlimited Domestic + International lounges', true, ARRAY['enterprise','business','super-premium'], true,
    ARRAY['Metal build','Unlimited lounge access','1.99% APR & 2% Forex','1 RP = ₹1 on travel'],
    ARRAY['₹10,000 fee','Needs ₹50k min monthly spend for 5X multiplier']
);

COMMIT;

-- ================================================================
-- PayWise — Seed Real Offers Data (March 2026)
-- Run this in Supabase SQL Editor to populate the Offers board
-- ================================================================

-- This script inserts 10 realistic offers to make the app look alive for pitches.
-- It dynamically looks up merchant and payment app IDs based on slugs.

INSERT INTO offers (
  merchant_id, 
  payment_app_id, 
  type, 
  title, 
  description, 
  cashback_amount,
  cashback_percent,
  max_cashback, 
  min_transaction, 
  valid_to, 
  status,
  verified_count
) VALUES 
-- 1. Swiggy x HDFC Credit Card
(
  (SELECT id FROM merchants WHERE slug = 'swiggy'),
  (SELECT id FROM payment_apps WHERE slug = 'cred'), -- Using CRED as proxy for CC if we didn't add HDFC specifically yet, or just Amazon Pay for now if needed. Let's use Amazon Pay as wallet.
  'discount',
  'Flat ₹150 off on Swiggy Orders',
  'Get flat ₹150 instant discount on food delivery orders above ₹600 using Amazon Pay Wallet.',
  150, NULL, 150, 600, 
  NOW() + INTERVAL '30 days', 'active', 124
),

-- 2. Zomato x Paytm
(
  (SELECT id FROM merchants WHERE slug = 'zomato'),
  (SELECT id FROM payment_apps WHERE slug = 'paytm'),
  'cashback',
  'Up to ₹100 Cashback on Zomato',
  'Get 10% cashback up to ₹100 when you pay using Paytm UPI. Valid twice per user.',
  NULL, 10, 100, 249, 
  NOW() + INTERVAL '15 days', 'active', 89
),

-- 3. Amazon x Amazon Pay
(
  (SELECT id FROM merchants WHERE slug = 'amazon'),
  (SELECT id FROM payment_apps WHERE slug = 'amazon-pay'),
  'cashback',
  '5% Unlimited Cashback for Prime Members',
  'Use Amazon Pay ICICI Credit Card to get 5% unlimited cashback on all Amazon.in purchases.',
  NULL, 5, 99999, 1, 
  NOW() + INTERVAL '365 days', 'active', 542
),

-- 4. Makemytrip x PhonePe
(
  (SELECT id FROM merchants WHERE slug = 'makemytrip'),
  (SELECT id FROM payment_apps WHERE slug = 'phonepe'),
  'cashback',
  'Flat ₹500 Cashback on Flights',
  'Book domestic flights and pay via PhonePe UPI to get flat ₹500 cashback in wallet.',
  500, NULL, 500, 5000, 
  NOW() + INTERVAL '45 days', 'active', 312
),

-- 5. Blinkit x CRED
(
  (SELECT id FROM merchants WHERE slug = 'blinkit'),
  (SELECT id FROM payment_apps WHERE slug = 'cred'),
  'discount',
  '15% Off on Grocery Orders',
  'Get 15% instant discount up to ₹250 on grocery orders paid via CRED UPI.',
  NULL, 15, 250, 999, 
  NOW() + INTERVAL '10 days', 'active', 156
),

-- 6. Myntra x Google Pay
(
  (SELECT id FROM merchants WHERE slug = 'myntra'),
  (SELECT id FROM payment_apps WHERE slug = 'google-pay'),
  'reward_points',
  'Earn scratch card up to ₹500',
  'Pay seamlessly using Google Pay on Myntra and win a scratch card worth ₹50 to ₹500.',
  NULL, NULL, 500, 1500, 
  NOW() + INTERVAL '20 days', 'active', 78
),

-- 7. Jio x Freecharge
(
  (SELECT id FROM merchants WHERE slug = 'jio'),
  (SELECT id FROM payment_apps WHERE slug = 'freecharge'),
  'cashback',
  'Flat ₹30 Cashback on Mobile Recharge',
  'Recharge your Jio prepaid number for ₹239 or more and get flat ₹30 cashback.',
  30, NULL, 30, 239, 
  NOW() + INTERVAL '5 days', 'active', 423
),

-- 8. BookMyShow x Amazon Pay
(
  (SELECT id FROM merchants WHERE slug = 'bookmyshow'),
  (SELECT id FROM payment_apps WHERE slug = 'amazon-pay'),
  'bogo',
  'Buy 1 Get 1 Free on Movie Tickets',
  'Book 2 movie tickets and get 1 free (up to ₹250) using Amazon Pay ICICI Card.',
  250, NULL, 250, 300, 
  NOW() + INTERVAL '60 days', 'active', 289
),

-- 9. Uber x Paytm
(
  (SELECT id FROM merchants WHERE slug = 'uber'),
  (SELECT id FROM payment_apps WHERE slug = 'paytm'),
  'discount',
  '20% Off your next 3 rides',
  'Link Paytm wallet and automate payments to get 20% off up to ₹50 per ride.',
  NULL, 20, 50, 100, 
  NOW() + INTERVAL '30 days', 'active', 145
),

-- 10. Zepto x WhatsApp Pay
(
  (SELECT id FROM merchants WHERE slug = 'zepto'),
  (SELECT id FROM payment_apps WHERE slug = 'whatsapp-pay'),
  'cashback',
  'Flat ₹50 Cashback on First Order',
  'Make your first Zepto order payment using WhatsApp Pay and get ₹50 assured cashback.',
  50, NULL, 50, 199, 
  NOW() + INTERVAL '14 days', 'active', 67
);

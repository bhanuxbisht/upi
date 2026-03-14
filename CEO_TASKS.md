# CEO Tasks — What Bhanu Needs To Do

> **This is your personal action list.** Everything here is something ONLY YOU can do — no AI, no code, no automation can replace these tasks. These are what make PayWise a real company, not a prototype.
>
> **Last updated:** 14 March 2026
> **Status:** Phase 1 code is DONE. The engine is built. It's waiting for YOUR fuel (data).

---

## THE SITUATION RIGHT NOW

The codebase does the following correctly:
- ✅ AI chat works with 4-layer fallback (Calculator → RAG → DB Fetch → TypeScript)
- ✅ Admin APIs exist for managing credit cards, UPI apps, strategies, and offers
- ✅ Every mutation emits events to the outbox for future async processing
- ✅ Freshness metadata and confidence levels are tracked on every knowledge item
- ✅ Transaction import with proper date parsing and source tracking

**BUT the database is EMPTY.** Everything is falling back to hardcoded TypeScript data from March 5th. The system works but it's running on stale fuel. Your data entry is the #1 blocker.

---

## TASK 1: Run the Database Migrations (5 MINUTES — DO THIS TODAY)

Two new SQL files need to be run in your Supabase SQL Editor.

### Steps:
1. Go to your Supabase project → SQL Editor
2. Open `supabase/migrations/006_user_transactions_import_alignment.sql`
3. Copy-paste and run it
4. Open `supabase/migrations/007_event_outbox.sql`
5. Copy-paste and run it
6. Verify: In Table Editor, you should see a new `event_outbox` table

Both scripts are idempotent — safe to run multiple times.

---

## TASK 2: Verified Credit Card Data (URGENT — This Week)

I need real, verified data on the top 20 credit cards Indian professionals use. Not from blogs — from bank websites, your own cards, or RM conversations.

### What To Collect Per Card

```
Card Name: [e.g., HDFC Regalia Gold]
Bank: [HDFC / SBI / ICICI / Axis / etc.]
Annual Fee: ₹[amount]
Fee Waiver Condition: [e.g., "₹3L annual spend"]
Joining Fee: ₹[amount]
Network: [Visa / Mastercard / RuPay]
Income Requirement: ₹[X]L annual

Rewards (list ALL categories you can find):
  - Online shopping: [X]% cashback / [X] points per ₹[Y]
  - Food delivery: [X]%
  - Groceries: [X]%
  - Travel/flights: [X]%
  - Fuel: [X]%
  - UPI transactions: [X]%
  - Everything else (general): [X]%

Monthly/Quarterly caps: [any limits on cashback]
Lounge access: [domestic / international count]
Fuel surcharge waiver: [Yes / No, up to ₹X]

Best for: [who should get this card — e.g., "heavy online shoppers spending ₹50K+/month"]
Worst for: [who should NOT get this card]

Source: [bank website URL / RM call / personal experience]
Date verified: [when YOU last checked this was accurate]
### Phase 1: THE SBI DEEP-DIVE
**Status:** In Progress
> **Goal:** Map every single SBI sub-card perfectly. By focusing on one bank ecosystem first, we ensure our calculation engine is 100% accurate before scaling.

**Research these SBI Cards:**
1. SBI Cashback Credit Card (Online shopping)
2. SBI SimplyCLICK Credit Card (Amazon/Cleartrip/Netmeds)
3. SBI SimplySAVE Credit Card (Offline/dining/groceries)
4. SBI Elite Credit Card (Premium travel/lounge)
5. SBI Aurum Credit Card (Super Premium)
6. SBI Prime Credit Card
7. BPCL SBI Card (Fuel)
8. BPCL SBI Card OCTANE (Fuel premium)
9. IRCTC SBI Card (Platinum / Premier)
10. Air India SBI Platinum / Signature
11. Yatra SBI Card
12. Club Vistara SBI Card
13. Paytm SBI Card
14. Reliance SBI Card

---

### Phase 2: THE HDFC ECOSYSTEM
**Status:** Not Started
> **Goal:** Once SBI is perfectly mastered, we expand to India's largest private card issuer.

**Key HDFC Cards to map later:**
1. HDFC Swiggy Credit Card (10% Food Delivery)
2. HDFC Millennia (General online shopping)
3. HDFC Tata Neu Plus/Infinity (RuPay UPI dominance)
4. HDFC Regalia / Regalia Gold (Mid-tier lifestyle)
5. HDFC Infinia (Super premium)
*(Plus Indian Oil HDFC, Shoppers Stop HDFC, etc.)*

---

### Phase 3: AXIS & ICICI ECOSYSTEMS
**Status:** Not Started
> **Goal:** Expanding to the remaining major players.

**Key Cards to map later:**
- Axis ACE, Flipkart Axis, Airtel Axis
- Amazon Pay ICICI, ICICI Emeralde/Coral

---

### The End Result
Once we have systematically researched **every bank in the Indian market** step-by-step, our engine will be the only one capable of saying: *"I have compared your exact ₹10,000 spend across all 250 cards in India. Your SBI Cashback card is mathematically the best choice."*
- **Bank websites** → Go to the card's page, screenshot the rewards table
- **CardExpert.in** → Detailed card reviews (cross-check with bank site)
- **TechnoFino.in** → Community discussions about real reward rates
- **r/IndianCreditCards** (Reddit) → Real users reporting what they actually got
- **@CardMafia / @LiveFromLounge** (Twitter/X) → Daily offer updates
- **Your own cards** → Check your card's rewards section in the bank app

### How To Give Me The Data
Write it in any format — text file, Excel, Google Sheet, or even WhatsApp-style notes. I will structure it into the database. Don't worry about formatting.

---

## TASK 3: Live Offers — What's ACTUALLY Working Right Now (URGENT)

Our hardcoded offers are static. I need you to find out what's **live this week** on major platforms.

### What To Check (Spend 30 min)

Open each app and note active offers:

**Swiggy:**
- Any bank card offers? (e.g., "15% off with HDFC cards")
- Any promo codes? (e.g., "SWIGGY200" for ₹200 off on ₹500+)
- PhonePe Switch integration offers?

**Zomato:**
- Active bank card offers?
- Promo codes visible on checkout?
- Zomato Gold / Pro pricing?

**Amazon:**
- Bank offers on the Amazon Pay page?
- Active coupon codes?
- Amazon Pay cashback promotions?

**Flipkart:**
- Bank offers visible on payment page?
- SuperCoin offers?
- Axis Bank / Flipkart Axis special deals?

**Bill Payments (PhonePe / GPay / Paytm):**
- Any scratch card promotions?
- Cashback on electricity/mobile recharge?
- Specific bank-linked offers?

### Format
For each offer:
```
Platform: Swiggy
Offer: 15% off up to ₹150 with HDFC credit cards
Min order: ₹500
Valid till: [date]
Code: [code if needed]
Source: [saw it in Swiggy app / bank SMS / Twitter]
Tested: [did you try it yourself?]
```

---

## TASK 4: Test Our AI — Find Where It Fails (This Week)

Go to your deployed app's `/ask` page. Ask these 10 questions and write down what went wrong:

| # | Question | Expected Answer | What AI Actually Said | Problem |
|---|----------|----------------|----------------------|---------|
| 1 | "I have SBI Cashback card and use PhonePe. I ordered ₹800 on Swiggy. Did I get the best deal?" | Should calculate SBI card reward on Swiggy and compare with alternatives | | |
| 2 | "Compare HDFC Millennia vs ICICI Amazon Pay for online shopping" | Should show exact reward rates, caps, fees for both | | |
| 3 | "I pay ₹25000 rent every month. Is CRED worth it?" | Should calculate if any card's rewards beat CRED's 1.5% fee | | |
| 4 | "What should I do differently this month to save more?" | Should look at spending data and give 3 specific actions | | |
| 5 | "I spent ₹45000 last month. Where am I wasting money?" | Should compare against Indian averages per category | | |
| 6 | "Should I get a new credit card? I earn ₹8 lakhs." | Should recommend cards within income range (not Infinia) | | |
| 7 | "Best way to pay electricity bill in Delhi" | Should compare PhonePe / GPay / Paytm offers for bills | | |
| 8 | "I'm going to Goa. How to save on flights and hotels?" | Should recommend HDFC SmartBuy, card lounge access, travel card combos | | |
| 9 | "My Netflix + Spotify + YouTube Premium cost ₹1500/month. Help me reduce." | Should check if mobile plans include OTT, suggest family plans | | |
| 10 | "What's the Amazon Pay ICICI card cashback — on Amazon vs outside?" | Should give exact: 5% Prime/3% non-Prime on Amazon, 2% bill payments, 1% elsewhere | | |

**Fill this table and send it to me.** Every failure = a specific improvement I'll make in the AI.

---

## TASK 5: Model Training Data — What We Need For True Intelligence

> **This is critical.** Our AI currently uses a pre-trained LLM (Llama 3.3 70B) with our data injected via prompts. For the AI to be TRULY intelligent about Indian payments, we need training data. Here's exactly what you need to collect:

### 5A. Question-Answer Pairs (100+ needed)

Write realistic questions an Indian user would ask, paired with the CORRECT answer. These will be used to:
1. Test our current AI for accuracy
2. Fine-tune a future model
3. Build our evaluation benchmark

**Format:**
```
Q: Best way to pay ₹800 at Swiggy?
A: Use HDFC Swiggy card (10% = ₹80 cashback) + PhonePe Switch (₹50 coupon). Total savings: ₹130. Without special card: SBI Cashback (5% = ₹40) or Axis ACE via GPay (2% = ₹16).

Q: I earn ₹6 lakhs/year. Best first credit card?
A: IDFC First WOW (no annual fee, 3% cashback on groceries/dining), SBI Cashback (5% online, no annual fee with ₹2L spend), or Au LIT (customizable rewards, ₹199 fee). Avoid premium cards — Regalia needs ₹12L+ income.
```

**Collect from:**
- Your real conversations with friends about payments
- Questions from Reddit r/IndianCreditCards
- Common queries from CardExpert/TechnoFino forums
- Questions you'd ask yourself before buying something

### 5B. Offer Data with Verification Status

For each platform, I need 3 months of offer history:
```
Date: March 2026
Platform: Swiggy
Offer: 15% off with HDFC cards
Verified: Yes (I used it on March 12)
Actual cashback received: ₹87 on ₹580 order
```

This builds our **offer reliability model** — we can predict which offers are real vs marketing noise.

### 5C. Spending Patterns (Anonymized)

I need 5 real spending profiles (can be yours, friends, family — anonymized):
```
Profile: "Urban Professional, ₹60K income, Delhi"
Monthly breakdown:
  - Food delivery: ₹4000
  - Groceries: ₹6000
  - Shopping: ₹5000
  - Bills: ₹3000
  - Rent: ₹20000
  - Entertainment: ₹1500
  - Fuel: ₹2000
Cards: HDFC Millennia, SBI Cashback
Primary UPI: PhonePe
```

This helps us build **realistic test cases** and personalization models.

### 5D. Competitor AI Responses

Ask the same 10 questions from Task 4 to:
1. ChatGPT (free tier)
2. Google Gemini
3. CRED (if they have help chat)

Screenshot their answers. This is our **benchmark** — we need to be more specific and accurate than all of them.

### What I'll Do With This Data:

| Data Type | How I'll Use It | Impact |
|---|---|---|
| Q&A pairs (100+) | Build evaluation suite + fine-tuning dataset | Measure & improve accuracy |
| Offer history | Train offer reliability scoring model | Stop recommending dead offers |
| Spending profiles | Build realistic test personas | Better personalization |
| Competitor responses | Benchmark our quality | Prove we're better |

---

## TASK 6: Competitor Testing (This Week — 1 Hour)

Install/visit these and note ONE thing they do better than us:

| App/Site | What To Check | What They Do Well | What They Suck At |
|----------|--------------|-------------------|-------------------|
| **CRED** (app) | How they show offers per card | | |
| **CashKaro** (website) | Their merchant coverage, cashback tracking | | |
| **CardExpert.in** | Credit card comparison data depth | | |
| **CouponDunia** | How they find/test coupon codes | | |
| **BankBazaar** | Card recommendation flow | | |

**One sentence per competitor is enough.** I just need to know where we're behind.

---

## TASK 7: Start Your Financier Network (Ongoing)

These conversations take time. Start now, even casually:

### People To Talk To

1. **Your bank's relationship manager** — Call your HDFC/SBI/ICICI branch. Ask: "What are the latest credit card offers? Can I get a dedicated RM?" They share offer details freely. This is literally their job.

2. **Credit card communities:**
   - Join r/IndianCreditCards on Reddit
   - Follow @CardMafia on Twitter/X
   - Join TechnoFino forum
   - Action: Post ONE question about a card each week. You'll learn fast.

3. **3 friends who use credit cards actively** — Ask them:
   - What cards do you have?
   - What's the best deal you got recently?
   - Would you use an app that tells you the best way to pay every time?

4. **Small finance fintech people** — LinkedIn cold outreach to 5 people at CRED, BankBazaar, CashKaro, Groww. Even if they don't respond, you learn from their profiles.

### Why This Matters
Every conversation = data we can't get any other way. Blog data is 3-6 months old. Forum data is anecdotal. **Direct information from banks and active users is 100% accurate.** That accuracy IS our product.

---

## TASK 8: Set Up Revenue Basics (Week 2)

### Razorpay Account
1. Go to https://razorpay.com — sign up with your PAN/business details
2. Complete KYC (takes 1-2 days)
3. Get Test Mode API keys
4. Share `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` with me (add to `.env.local`)

### Affiliate Programs
Apply to these — most approve within 1 week:
1. **BankBazaar** affiliate — they pay ₹500-2000 per card application
2. **Amazon Associates** — standard affiliate program
3. **Flipkart Affiliate** — standard affiliate program
4. **PaisaBazaar** affiliate — competing service but good payout

### Why Now
Revenue Day 1 = "we're a business" at the next investor conversation. Even ₹10,000/month changes the narrative from "idea" to "startup."

---

## TASK 9: Beta User Recruitment (Ongoing)

We need 50 beta users before any major feature push. Here's where:

1. **Your personal network** — Message 20 friends: "I built an app that saves money on every digital payment. Will you try it for 1 week?"
2. **Reddit** — Post on r/IndiaInvestments, r/IndianCreditCards: "Built a free tool that shows the best way to pay at any merchant"
3. **Twitter/X** — 3 posts per week about Indian payment tips (builds audience AND tests our knowledge)
4. **LinkedIn** — Post about building PayWise (attracts both users and potential co-founders)

### What To Track
- How many signed up
- How many asked AI a question
- What they asked (send me screenshots)
- What they complained about

---

## TASK 10: Decide Event Consumer Approach (5 MINUTES)

Our system now writes events (transaction.created, offer.updated, etc.) to a database queue. But nothing READS those events yet. I need you to pick one:

| Option | Cost | Complexity | My Recommendation |
|---|---|---|---|
| **A: Vercel Cron** | Free (Vercel Pro) | Simple | ✅ Start here |
| **B: Supabase Edge Function** | Free (Supabase) | Medium | Good alternative |
| **C: Upstash QStash** | ₹1500-3000/mo | Production-grade | Later |

Just tell me "Option A" and I'll build it.

---

## PRIORITY ORDER (Updated 14 March 2026)

| # | Task | Time | Urgency |
|---|------|------|---------|
| 1 | Run DB migrations (Task 1) | 5 min | **TODAY** |
| 2 | Decide event consumer (Task 10) | 2 min | **TODAY** |
| 3 | Test our AI (Task 4) | 30 min | **TODAY** |
| 4 | Live offers (Task 3) | 30 min | **THIS WEEK** |
| 5 | Credit card data — top 10 (Task 2) | 2-3 hours | **THIS WEEK** |
| 6 | Q&A training pairs — 20 starter (Task 5A) | 1 hour | **THIS WEEK** |
| 7 | Competitor testing (Task 6) | 1 hour | **THIS WEEK** |
| 8 | Razorpay account (Task 8) | 20 min | **THIS WEEK** |
| 9 | Spending profiles (Task 5C) | 30 min | **NEXT WEEK** |
| 10 | Affiliate program signups (Task 8) | 30 min | **NEXT WEEK** |
| 11 | Credit card data — remaining 10 (Task 2) | 2 hours | **NEXT WEEK** |
| 12 | Competitor AI responses (Task 5D) | 30 min | **NEXT WEEK** |
| 13 | Q&A training pairs — 80 more (Task 5A) | 3 hours | **WEEK 3** |
| 14 | Financier conversations (Task 7) | Ongoing | **START NOW** |
| 15 | Beta user recruitment (Task 9) | Ongoing | **AFTER REVENUE** |

---

## HOW TO SHARE DATA WITH ME

Any of these work — I'll structure it:
- Paste text in chat
- Take screenshots and describe
- Create a Google Sheet and share the link
- Write notes in a text file in this project folder
- Just tell me verbally — "HDFC Regalia gives 4 points per ₹150 on travel, I checked today"

**Don't overthink the format. Speed > perfection. Get me data, I'll build the system.**

---

*Every card detail you verify, every offer you confirm, every Q&A pair you write, every user you recruit — that's your equity in this company. No one else can do this part.*

*— CTO*

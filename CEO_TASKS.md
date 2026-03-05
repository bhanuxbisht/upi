# CEO Tasks — What Bhanu Needs To Do

> **This is your personal action list.** Everything here is something ONLY YOU can do — no AI, no code, no automation can replace these tasks. These are what make PayWise a real company, not a prototype.
>
> **Last updated:** 5 March 2026

---

## WHY THIS FILE EXISTS

We identified that PayWise currently has a **sophisticated prompt-engineering system, not a real AI assistant**. The knowledge is hardcoded in TypeScript files, offers go stale the moment they're written, and the AI reformats our static data instead of doing real intelligence.

**Your data work is what transforms us from chatbot to product.** The CTO builds the engine, but you provide the fuel.

---

## TASK 1: Verified Credit Card Data (URGENT — This Week)

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
Confidence: [High / Medium / Low]
```

### Start With These 20 Cards (Priority Order)

**Must have (your users likely have these):**
1. HDFC Regalia / Regalia Gold
2. HDFC Millennia
3. HDFC Infinia (super premium — know it even if you can't get it)
4. SBI Cashback Card
5. SBI SimplySAVE
6. ICICI Amazon Pay Card
7. ICICI Emeralde / Sapphiro
8. Axis Flipkart Card
9. Axis ACE Card
10. OneCard (Metal)

**Good to have:**
11. AU Small Finance LIT Card
12. HDFC Swiggy Card
13. IndusInd Tiger Card
14. IDFC First WOW / Classic
15. Kotak 811 Card
16. RBL ShopRite / BankBazaar
17. Amex MRCC (Membership Rewards)
18. HSBC Cashback Card
19. Standard Chartered Ultimate
20. Federal Bank Scapia

### Where To Find This Data
- **Bank websites** → Go to the card's page, screenshot the rewards table
- **CardExpert.in** → Detailed card reviews (cross-check with bank site)
- **TechnoFino.in** → Community discussions about real reward rates
- **r/IndianCreditCards** (Reddit) → Real users reporting what they actually got
- **@CardMafia / @LiveFromLounge** (Twitter/X) → Daily offer updates
- **Your own cards** → Check your card's rewards section in the bank app

### How To Give Me The Data
Write it in any format — text file, Excel, Google Sheet, or even WhatsApp-style notes. I will structure it into the database. Don't worry about formatting.

---

## TASK 2: Live Offers — What's ACTUALLY Working Right Now (URGENT)

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

## TASK 3: Test Our AI — Find Where It Fails (This Week)

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

## TASK 4: Competitor Testing (This Week — 1 Hour)

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

## TASK 5: Start Your Financier Network (Ongoing)

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

## TASK 6: Set Up Revenue Basics (Week 2)

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

## TASK 7: Beta User Recruitment (Ongoing)

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

## PRIORITY ORDER

| # | Task | Time | Urgency |
|---|------|------|---------|
| 1 | Test our AI (10 questions) | 30 min | TODAY |
| 2 | Live offers (check 5 apps) | 30 min | TODAY |
| 3 | Credit card data (top 10 first) | 2-3 hours | THIS WEEK |
| 4 | Competitor testing | 1 hour | THIS WEEK |
| 5 | Razorpay account | 20 min | THIS WEEK |
| 6 | Affiliate program signups | 30 min | THIS WEEK |
| 7 | Credit card data (remaining 10) | 2 hours | NEXT WEEK |
| 8 | Financier conversations | Ongoing | START NOW |
| 9 | Beta user recruitment | Ongoing | AFTER REVENUE FEATURES |

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

*Every card detail you verify, every offer you confirm, every user you recruit — that's your equity in this company. No one else can do this part.*

*— CTO*

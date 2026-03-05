# CTO Technical Plan — What The AI Co-Founder Will Build

> **This document explains WHAT I (the CTO) will build, WHY each piece matters, and HOW it transforms PayWise from a prompt-engineering chatbot into a real AI financial assistant.**
>
> Written so Bhanu (CEO) can understand every decision without needing to know the code.
>
> **Last updated:** 5 March 2026

---

## THE CORE PROBLEM I'M SOLVING

Right now, our "AI" works like this:

```
User asks: "Best way to pay ₹500 at Swiggy?"
                    ↓
Our code checks if the word "swiggy" appears in the question (regex)
                    ↓
If yes → Pull hardcoded Swiggy data from a TypeScript file
                    ↓
Stuff ALL that data into a giant text prompt
                    ↓
Send to Groq (LLM) → "Hey, reformat this data into a nice answer"
                    ↓
User gets a nicely written answer
```

**The LLM is doing zero thinking. It's a text reformatter.** If our hardcoded data is wrong, the answer is wrong. If the user misspells "swigy", we find nothing. If HDFC changes a reward rate tomorrow, we're giving wrong advice until someone manually edits code.

### What It Should Be

```
User asks: "Best way to pay ₹500 at Swiggy?"
                    ↓
Embed the question into a vector (meaning-based search)
                    ↓
Search our VERIFIED DATABASE for relevant data:
  - Swiggy-specific card offers (from live DB, updated by Bhanu)
  - User's actual cards (from their profile)
  - Current active promo codes (from verified offers table)
  - Stacking strategies tested for food delivery
                    ↓
Send ONLY the relevant 5-10 data points to the LLM (not everything)
                    ↓
LLM reasons with accurate data + user's personal context
                    ↓
User gets a PERSONALIZED, ACCURATE answer
```

**That's RAG (Retrieval-Augmented Generation).** Same LLM, but we give it a search engine for our own verified data instead of dumping everything.

---

## WHAT I WILL BUILD (In Order)

### BUILD 1: Admin Panel for Data Management
**Timeline:** Next session
**Why it matters:** Right now, updating a credit card reward rate means editing TypeScript code and redeploying the entire app. That's insane for a data product.

**What it does:**
- Web UI at `/admin/knowledge` where Bhanu can add/edit/delete:
  - Credit cards (all reward rates, fees, requirements)
  - UPI app cashback patterns
  - Live offers and promo codes
  - Stacking strategies
- Every entry has: `last_verified_date`, `verified_by`, `confidence_level`, `source_url`
- Search, filter, sort by any field
- "Mark as expired" button for outdated offers

**What changes for the user:** Nothing visible yet — but now Bhanu can update data in 30 seconds instead of needing a code deployment.

**Database tables I'll create:**
```
knowledge_credit_cards    → All card data (replaces hardcoded TypeScript)
knowledge_upi_apps        → All UPI app data (replaces hardcoded TypeScript)
knowledge_offers          → Live verified offers (replaces stale seed data)
knowledge_strategies      → Stacking strategies & payment tips
knowledge_merchants       → Merchant → category mapping (50K+ eventually)
```

### BUILD 2: Move Knowledge from Code → Database
**Timeline:** Same session as Build 1
**Why it matters:** The foundation for everything else. Can't do RAG on TypeScript files.

**What it does:**
- Migrate all 14 credit cards from `credit-cards.ts` → `knowledge_credit_cards` table
- Migrate all 6 UPI apps from `upi-apps.ts` → `knowledge_upi_apps` table
- Migrate all strategies from `payment-strategies.ts` → `knowledge_strategies` table
- Update the context builder to read from Supabase instead of imports
- Keep the TypeScript files as fallback (if DB query fails, use hardcoded)

**What changes for the user:** Still nothing visible — but now the AI gives answers from a database that Bhanu updates, not from static code.

### BUILD 3: Vector Search (Semantic RAG)
**Timeline:** Session after Build 1-2
**Why it matters:** This is the single biggest upgrade. It's the difference between "search engine" and "AI assistant."

**What it does in simple terms:**

| Concept | Analogy | What It Means |
|---------|---------|--------------|
| **Embedding** | Converting a sentence into GPS coordinates | Turn "best card for food delivery" into numbers like [0.23, 0.87, 0.12, ...] |
| **Vector** | The GPS coordinates | A list of 1536 numbers that represent the MEANING of text |
| **Vector search** | "Find all restaurants within 5km of me" | "Find all data entries whose MEANING is close to what the user asked" |
| **Similarity** | Distance between two GPS points | How closely a card/offer/strategy matches the user's question |

**Technical implementation:**
```
Step 1: When Bhanu adds a card to the admin panel:
  → Generate embedding for: "HDFC Regalia credit card premium travel 
     dining rewards 5% lounge access ₹2500 annual fee"
  → Store the embedding (1536 numbers) alongside the card data

Step 2: When user asks "best card for ordering food online":
  → Generate embedding for that question
  → Search: "Which stored embeddings are CLOSEST to this question?"
  → Result: HDFC Swiggy Card, SBI Cashback, ICICI Amazon Pay (top 3 matches)
  → Send ONLY those 3 cards (not all 80+) to the LLM

Step 3: LLM gets a focused, accurate context
  → Gives a specific answer about those 3 cards
  → No hallucination (data is verified)
  → No wasted tokens (only relevant data)
```

**Why this beats our current system:**
- "swigy" (misspelled) still finds Swiggy (meaning-based, not keyword-based)
- "food ordering app" finds Swiggy/Zomato even though user didn't name them
- Works with 500 cards as easily as 14 (scales)
- New data is searchable immediately (no code changes)

**Technology:** Supabase has built-in pgvector support. We don't need Pinecone or any external service. Cost: ₹0 extra.

### BUILD 4: Smart Onboarding Flow
**Timeline:** After RAG is working
**Why it matters:** The AI currently treats every user the same. A college student and a ₹30L/year professional get identical recommendations. That's broken.

**What it does:**
First time a user visits `/ask`, show 3 quick questions:
1. "What credit/debit cards do you have?" → Multi-select from our database
2. "Which payment apps do you use?" → Multi-select (PhonePe, GPay, Paytm, etc.)
3. "Monthly spending range?" → Dropdown (Under ₹20K / ₹20-50K / ₹50K-1L / ₹1L+)

**What changes for the user:** Every AI answer is now PERSONAL.
- "You have HDFC Millennia, so use that for 2.5% on Swiggy"
- "Since you use PhonePe, check for their scratch card first"
- "At your spending level, the SBI Cashback Card would be better than ICICI Amazon Pay"

### BUILD 5: Real Proactive Insights (Not Hardcoded Rules)
**Timeline:** After onboarding
**Why it matters:** Current insights API is if/else rules — "if user has transactions, show generic tip." A real system uses their actual data.

**What it does:**
- Analyze user's REAL transactions: "You paid ₹800 at Swiggy via GPay 6 times this month"
- Compare against optimal: "HDFC Millennia would have saved you ₹120 total on those 6 orders"
- Generate insight: "Switch to HDFC Millennia for Swiggy — you'd save ₹120/month"
- Show on dashboard + send as notification

**What changes for the user:** Dashboard shows money they ACTUALLY lost, not generic tips. This is the "regret-driven engagement" from the Strategic Analysis — and it works because it's real.

### BUILD 6: Razorpay Pro Subscription
**Timeline:** When Bhanu shares API keys
**Why it matters:** Revenue = we're a real company.

**What it does:**
- Pro plan: ₹99/month (₹999/year)
- Integrated in checkout flow at `/pricing` or when free user hits limit
- Pro unlocks: Unlimited AI queries, priority insights, export reports
- Webhook handles payment success/failure, updates `pro_user` flag

### BUILD 7: Affiliate Link Tracking
**Timeline:** After Razorpay
**Why it matters:** Pure revenue with zero cost. When AI recommends a card and user clicks to apply, we earn ₹500-2000.

**What it does:**
- Every credit card recommendation includes "Apply via PayWise" link
- Link goes through our tracking: `/go/hdfc-regalia?ref=ai-chat`
- We log the click + user + source
- If user applies (tracked via affiliate dashboard), we earn commission
- AI naturally recommends the BEST card — affiliate revenue is aligned with user value

---

## WHAT I WON'T BUILD (And Why)

| Thing | Why Not Now |
|-------|-----------|
| Fine-tuned PayWise model | RAG with Groq gives 90% of the benefit at 0% of the cost. Fine-tuning needs ₹5-10L in compute and 100K+ training examples we don't have yet. |
| Voice AI agent | Needs a mobile app + background services + on-device ML. That's a 6-person team job, not a solo dev job. After funding. |
| Chrome extension | Good idea but lower priority than making the core product intelligent. One thing at a time. |
| React Native app | Same reasoning. Web-first, mobile-responsive. App after 5K users. |
| Bank API integrations | Requires business partnerships and regulatory approval. After traction. |
| Multi-language | English-first, Hindi after 10K users. |

---

## HOW THE INTELLIGENCE WORKS (For Bhanu To Understand)

### Layer 1: Your Verified Data (THE MOAT)
```
You talk to HDFC RM → "Regalia gives 4 points per ₹150 on travel"
You add this to Admin Panel → saved in database with "verified: March 5, 2026"
```
**No competitor has this.** Blog data is stale. LLM data is hallucinated. Your data is verified.

### Layer 2: Vector Search (THE BRAIN)
```
User asks anything about travel cards
→ System finds the 5 most relevant cards for travel
→ Including Regalia which you just verified
→ Sends ONLY those 5 to the LLM
```
**This is RAG.** That's it. Search your data, feed relevant results to the LLM, get accurate answers.

### Layer 3: User Context (THE PERSONALIZATION)
```
User has: HDFC Millennia + PhonePe + ₹40K/month budget
→ AI knows this from onboarding
→ Only recommends things relevant to THEIR situation
→ "Don't get Infinia (needs ₹20L income), try Regalia instead"
```

### Layer 4: LLM Reasoning (THE VOICE)
```
Verified data + relevant search results + user context
→ LLM combines all of this into a natural, conversational answer
→ With exact ₹ amounts, comparisons, and one clear action
```

**This is NOT prompt engineering.** The LLM is doing real reasoning — comparing cards, calculating savings, personalizing for the user. It just has accurate ingredients to work with instead of guessing.

---

## TIMELINE

| Week | What I Build | What Bhanu Does | Result |
|------|-------------|----------------|--------|
| **This session** | Admin panel + DB migration | Test AI, collect live offers | Data is manageable without code |
| **Next session** | Vector search (RAG) | Credit card data (top 20) | AI gives accurate, relevant answers |
| **Session 3** | Onboarding flow + personalization | Competitor analysis | Every answer is personal |
| **Session 4** | Razorpay + affiliate links | Set up Razorpay + affiliate accounts | Revenue from Day 1 |
| **Session 5** | Smart insights + dashboard upgrade | First 50 beta users | Product people actually use |

---

## WHAT I NEED FROM BHANU (Minimum Viable Data)

Before I can make the AI genuinely useful, I need at minimum:

| Data | Minimum | Ideal | Why |
|------|---------|-------|-----|
| Credit card details | 10 cards | 20 cards | Can't recommend cards we don't know about |
| Live offers | 10 offers | 30 offers | Need CURRENT data, not 6-month-old blog posts |
| AI test results | 5 failure cases | 10 failure cases | I fix what I can measure |
| Razorpay keys | Test keys | Live keys | Can't build payments without keys |

**I can build all the infrastructure in the world, but if the data is wrong, the product is wrong. Your verified data IS the product.**

---

## METRICS THAT PROVE WE'RE WORKING

After these builds, we should see:

| Metric | Current | Target | How We Measure |
|--------|---------|--------|---------------|
| AI accuracy on card questions | ~60% (generic/stale data) | >90% (verified DB data) | Bhanu's 10-question test |
| Unique answers (not generic) | ~20% of responses | >80% | Manual review of AI responses |
| Revenue | ₹0 | ₹10K+ first month | Razorpay dashboard + affiliate dashboard |
| Data freshness | Static (March 2026 hardcode) | Updated weekly by Bhanu | `last_verified_date` in admin panel |
| User completes onboarding | 0% (doesn't exist) | >60% of new users | Supabase user_profiles filled rate |

---

*The intelligence isn't in the code. It's in the combination of verified data + smart retrieval + personal context + capable LLM. I build the system. You provide the truth. Together, that's something no competitor can replicate.*

*— CTO / AI Co-Founder*

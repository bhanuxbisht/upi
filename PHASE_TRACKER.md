# PayWise — Phase Tracker

> **What we're building:** A personal finance assistant that tells every Indian exactly HOW to pay and WHERE to pay to save the most money — which UPI app, which credit card, which combo, which promo code — every single time.
>
> **The vision:** Open PayWise before ANY payment. It tells you: "Use HDFC Millennia on PhonePe → Rs.187 saved." That's it. That's the product.
>
> **Last updated:** 5 March 2026

---

## PHASE 1: FOUNDATION — COMPLETED

**What we built:** The entire app skeleton — pages, auth, database, offers, savings tracking, admin panel.

| Feature | Status | Key Files |
|---------|--------|-----------|
| Homepage with hero, stats, features | Done | `src/app/page.tsx` |
| Offer dashboard with filters | Done | `src/app/offers/page.tsx` |
| "Best Way to Pay" recommender | Done | `src/app/recommend/page.tsx` |
| Community offer submission | Done | `src/app/submit/page.tsx` |
| Login/Signup (Google OAuth + Magic Link) | Done | `src/app/login/`, `src/app/signup/` |
| Savings counter + tracker + dashboard | Done | `src/app/savings/page.tsx` |
| Admin panel (add/manage offers, review submissions) | Done | `src/app/admin/page.tsx` |
| Rate limiting on all API routes | Done | `src/lib/rate-limit.ts` |
| RLS + Zod validation + IDOR protection | Done | All API routes |
| Supabase connected, 15+ tables | Done | `supabase/schema.sql` |

**Result:** App runs, builds clean (33 routes, 0 errors), auth works, offers display, savings track.

---

## PHASE 2: AI INTELLIGENCE — COMPLETED

**What we built:** AI chat system, knowledge engine, query analyzer, spending dashboard.

| Feature | Status | Key Files |
|---------|--------|-----------|
| Groq API (Llama 3.3 70B) integration | Done | `src/lib/ai/gemini.ts` |
| Domain-expert system prompt | Done | `src/lib/ai/prompts.ts` |
| Knowledge engine (14 cards, 6 UPI apps, 7 strategies) | Done | `src/lib/ai/knowledge/` |
| Query analyzer (15 intents, 35+ merchants) | Done | `src/lib/ai/query-analyzer.ts` |
| Context builder with knowledge injection | Done | `src/lib/ai/context-builder.ts` |
| "Ask PayWise" chat page (8 quick actions) | Done | `src/app/ask/page.tsx` |
| Proactive insights API (5 types) | Done | `src/app/api/ai/insights/` |
| Transaction import (SMS parsing) | Done | `src/app/api/transactions/import/` |
| Personal finance dashboard | Done | `src/app/dashboard/page.tsx` |
| DPDP compliance (data export + deletion) | Done | `src/app/api/data/` |

**Result:** Users can ask AI payment questions, get answers with specific card/app recommendations. BUT — data is hardcoded in TypeScript files (goes stale), query matching is keyword-based (breaks on typos).

---

## PHASE 3: REAL DATA + SMART RETRIEVAL — IN PROGRESS

**Priority:** Move from hardcoded knowledge to a living, updatable database. This is what makes the AI actually useful.

**Why this matters:** Right now, if HDFC changes a reward rate tomorrow, our AI gives wrong advice until someone edits TypeScript code and redeploys. That's not a product — that's a prototype. We need Bhanu to update data in 30 seconds via the admin panel, and the AI immediately gives correct answers.

### What we're building NOW:

| # | Build | What It Does | Why It Matters |
|---|-------|-------------|----------------|
| 1 | Knowledge DB tables | `knowledge_credit_cards`, `knowledge_upi_apps`, `knowledge_strategies` in Supabase | Data lives in DB, not code. Can be updated without deploy. |
| 2 | Admin Knowledge panel | New tabs in `/admin` to add/edit/delete cards, apps, strategies | Bhanu can update data in 30 seconds |
| 3 | Data migration | Move 14 cards + 6 apps + 7 strategies from TypeScript to DB | Existing knowledge preserved |
| 4 | Context builder upgrade | AI reads from Supabase instead of TypeScript imports | AI always uses latest verified data |

### What Bhanu does in parallel:
- Verify top 20 credit card details from bank websites (CEO_TASKS.md Task 1)
- Collect live offers from 5 apps (CEO_TASKS.md Task 2)
- Test AI with 10 questions, document failures (CEO_TASKS.md Task 3)

---

## PHASE 4: PERSONALIZATION + ONBOARDING — NEXT

**What we'll build:** Make the AI know WHO is asking, not just WHAT they're asking.

| # | Build | What It Does |
|---|-------|-------------|
| 1 | Smart onboarding | "What cards do you have? Which apps? Monthly spend?" — 3 questions on first visit |
| 2 | Personal AI answers | "Since YOU have HDFC Millennia, use that for Swiggy" (not generic) |
| 3 | Vector search (RAG) | Semantic search on knowledge DB — "food ordering" finds Swiggy/Zomato even without naming them |
| 4 | Real proactive insights | "You paid Swiggy 6 times via GPay — HDFC Millennia saves Rs.120/month" |

---

## PHASE 5: REVENUE — AFTER PERSONALIZATION

| # | Build | Revenue |
|---|-------|---------|
| 1 | Razorpay Pro subscription | Rs.99/mo — unlimited AI, smart alerts |
| 2 | Affiliate card links | Rs.500-2000 per card application through PayWise |
| 3 | Sponsored placements | Payment apps pay for "Recommended" label |
| 4 | B2B Data API | Anonymized spending insights to fintech companies |

---

## PHASE 6: DISTRIBUTION — AFTER REVENUE

| # | Build | Why |
|---|-------|-----|
| 1 | Chrome extension | "Best way to pay" popup on Amazon/Flipkart checkout |
| 2 | WhatsApp bot | Ask PayWise on-the-go |
| 3 | Weekly email report | "You saved Rs.847 this week, missed Rs.234" |
| 4 | PWA / mobile app | Home screen access |

---

## THE NORTH STAR

Every Indian opens PayWise before making a payment. Not because we tell them to — because they KNOW they'll save money every time. That habit is worth Rs.5,200 Cr.

**Current state:** Phase 3 (Real Data) in progress.
**Revenue target:** Rs.10K first month after Phase 5.
**User target:** 50 beta users before Phase 5.

---

*This file tracks what's done and what's next. For technical details, see CTO_PLAN.md. For Bhanu's tasks, see CEO_TASKS.md.*

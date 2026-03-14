# PayWise AI — Development Progress

> Last updated: **5 March 2026**
> Status: **MVP Core + Savings Counter + Knowledge Engine + AI Architecture Pivot | Supabase Connected ✅**

---

## 🆕 Knowledge Engine & AI Architecture Pivot (March 5, 2026)

### Critical Discovery
A deep codebase audit revealed that PayWise's "AI" is actually a **prompt-engineering system, not a real AI assistant**. The LLM (Groq) does zero thinking — it reformats hardcoded TypeScript data. The query analyzer is regex-based (`q.includes("swiggy")`), knowledge is static code, and insights are if/else rules.

**Decision:** Pivot from prompt-stuffing → RAG (Retrieval-Augmented Generation) architecture. See `CTO_PLAN.md` for the full technical plan.

### What Was Built (March 5)

#### Knowledge Engine (3 Modules)
- [x] **Credit card knowledge** — `src/lib/ai/knowledge/credit-cards.ts` (572 lines)
  - 14 Indian credit cards with full reward rates, fees, requirements
  - `getBestCardsForCategory()`, `getBestCardForMerchant()`, `getCardRecommendation()`
  - `affiliateLink` + `affiliatePayout` fields for future revenue
- [x] **UPI app knowledge** — `src/lib/ai/knowledge/upi-apps.ts`
  - 6 UPI apps with market share, strategies, linked card support
  - `getBestUPIAppForCategory()`, `getOptimalAppStack()`
- [x] **Payment strategies** — `src/lib/ai/knowledge/payment-strategies.ts`
  - 7 offer stacking strategies, 4-week monthly routines
  - Subscription optimization, tax payment tips
  - `estimateMonthlySavings()`, `getRelevantStrategies()`
- [x] **Barrel exports** — `src/lib/ai/knowledge/index.ts`

#### Query Analyzer (654 lines)
- [x] **Intent detection** — `src/lib/ai/query-analyzer.ts`
  - 15 intent types: `payment_recommendation`, `card_recommendation`, `spending_analysis`, `offer_stacking`, `subscription_optimize`, `tax_savings`, `compare_apps`, `rent_payment`, `bill_optimization`, `monthly_routine`, `reward_maximization`, `merchant_specific`, `budget_advice`, `savings_check`, `general_advice`
  - 35+ merchant patterns with category mapping
  - 10 category keywords, entity extraction (merchants, amounts, apps, cards)
  - `analyzeQuery()` returns structured intent + entities + confidence
  - 15 specialized `buildKnowledgeContext()` dispatchers

#### AI System Overhaul
- [x] **Prompt rewrite** — `src/lib/ai/prompts.ts` (123 lines) — Domain-expert system prompt with `[VERIFIED DATA]` block, proactive insight prompt, categorization prompt
- [x] **Context builder upgrade** — `src/lib/ai/context-builder.ts` (284 lines) — Now accepts `userQuery` param, injects domain knowledge via query analyzer as `--- DOMAIN KNOWLEDGE ---` section
- [x] **Token limit increase** — `max_tokens: 1024 → 2048` in `src/lib/ai/gemini.ts`
- [x] **Chat API update** — `/api/ai/chat` now passes user message to context builder for knowledge injection

#### New API Endpoints
- [x] **Transaction import** — `POST /api/transactions/import` — Parses bank SMS/statements with 80+ merchant patterns, 10 payment app patterns, 3 amount regex formats, returns categorized transactions + quick insight
- [x] **Proactive insights** — `GET /api/ai/insights` — Generates 5 insight types (missed-saving, spending-alert, offer-alert, optimization-tip, milestone) sorted by urgency

#### Ask Page UI Overhaul
- [x] **8 domain-specific quick actions** (was 4 generic) — colored icons, detailed prompts for card comparison, offer stacking, rent optimization, etc.
- [x] **Proactive insights feed** — Fetches from `/api/ai/insights` on mount, shows up to 3 insights
- [x] **New hero state** — Bot icon with gradient, "Trained on 14 credit cards, 6 UPI apps & 100+ offers" tagline
- [x] **`Insight` interface** added to types

#### Documentation Overhaul
- [x] **CEO_TASKS.md** — 7 data tasks for Bhanu (verified card data, live offers, AI testing, competitor testing, financier network, Razorpay setup, beta recruitment)
- [x] **CTO_PLAN.md** — 7 technical builds explained in CEO-friendly language (admin panel, DB migration, vector search/RAG, onboarding, insights, Razorpay, affiliates)
- [x] **VISION.md** — 12-section vision document (₹5,200 Cr target, 24-month roadmap, revenue model, competitive moats)

### Known Limitations Identified
- Knowledge is hardcoded in TypeScript — goes stale immediately
- Query analyzer uses string matching (`q.includes()`), breaks on typos
- Insights are rule-based if/else, not data-driven
- No onboarding — all users get identical generic recommendations
- **Solution:** Admin panel → DB migration → pgvector RAG → Onboarding (see CTO_PLAN.md)

---

## PayWise AI — Phase 1 Foundation (March 4, 2026)

### What Was Built

#### AI Chat System ("Ask PayWise")
- [x] **Groq API integration** (Llama 3.3 70B Versatile) — `src/lib/ai/gemini.ts` — Free tier: 30 req/min, 14,400/day
- [x] **System prompt engineering** — Carefully crafted to prevent hallucination, block sensitive data requests — `src/lib/ai/prompts.ts`
- [x] **Context builder** — Builds user profile + spending history + savings context for AI — `src/lib/ai/context-builder.ts`
- [x] **Chat API route** — `/api/ai/chat` with auth, rate limiting, conversation persistence, usage tracking
- [x] **Chat page** — `/ask` with premium UI, quick actions, message history, usage limits

#### Personal Finance Dashboard
- [x] **Dashboard page** — `/dashboard` with spending analytics, category breakdown, payment app usage
- [x] **Spending analytics API** — `/api/analytics/spending`
- [x] **Transaction service** — Full CRUD + analytics computation — `src/services/transactions.ts`

#### User Profiles & Personalization
- [x] **Profile service** — Payment preferences, Pro subscription checks, AI usage limits — `src/services/profiles.ts`
- [x] **Profile API** — `/api/profile` (GET/PATCH)
- [x] **Transaction API** — `/api/transactions` (GET/POST)

#### Security & Compliance (DPDP Act 2023)
- [x] **Audit logging** — Every sensitive data access logged — `src/lib/security/audit.ts`
- [x] **Data export API** — `/api/data/export` — Users can download all their data
- [x] **Data deletion API** — `/api/data/delete` — Right to Erasure (permanent delete)
- [x] **RLS on all 7 new tables** — Row-level security for data isolation
- [x] **AI usage tracking** — Free: 3 queries/day, Pro: unlimited

#### Database Migration
- [x] **7 new tables** in `supabase/migrations/RUN_THIS_NEXT.sql`:
  - `user_profiles` — Payment preferences, cards, budgets, Pro status
  - `user_transactions` — Transaction journal with auto-computed missed savings
  - `ai_conversations` — Chat history with LLM context
  - `user_offer_matches` — Personalized offer scoring
  - `audit_logs` — Security compliance
  - `consent_records` — DPDP Act consent management
  - `ai_usage` — Usage tracking for free/pro limits
- [x] **Trigger functions** — Auto-calculate missed savings, auto-update timestamps
- [x] **Analytics views** — Monthly spending by category, payment app usage stats

#### Navigation Update
- [x] Added "Dashboard" and "Ask AI" to main navigation

### Routes Added (March 4-5)
| Route | Type | Description |
|-------|------|-------------|
| `/ask` | Dynamic | "Ask PayWise" AI chat interface (auth-gated) |
| `/dashboard` | Dynamic | Personal finance dashboard (auth-gated) |
| `/api/ai/chat` | POST | AI chat with Groq (Llama 3.3 70B), usage limits, conversation persistence |
| `/api/ai/insights` | GET | Proactive insights engine (5 types, urgency-sorted) |
| `/api/transactions` | GET/POST | Transaction CRUD with filters |
| `/api/transactions/import` | POST | SMS/bank statement parsing (80+ merchant patterns) |
| `/api/profile` | GET/PATCH | User profile management |
| `/api/analytics/spending` | GET | Spending analytics engine |
| `/api/data/export` | GET | DPDP data export |
| `/api/data/delete` | DELETE | DPDP right to erasure |

### AI Provider Status
- **Active:** Groq API (`llama-3.3-70b-versatile`) — env var `GROQ_API_KEY`
- **Installed but inactive:** `@google/generative-ai` (Gemini code exists in `gemini.ts` but is commented out)
- **Switch guide:** See `docs/AI_PROVIDER_SWITCH.md`

### Setup Required
1. Run `npm install` to install dependencies
2. Add `GROQ_API_KEY=your-key-here` to `.env.local`
3. Run `supabase/migrations/RUN_THIS_NEXT.sql` in Supabase SQL Editor
4. Run `supabase/migrations/004_knowledge_tables.sql`
5. Run `supabase/migrations/005_smart_retrieval.sql`
6. If upgrading an existing DB, run `supabase/migrations/006_user_transactions_import_alignment.sql`
7. Run `supabase/migrations/007_event_outbox.sql`

---


## Table of Contents

1. [What's Been Built](#1-whats-been-built)
2. [Supabase Placeholder Workaround (What Changed & Why)](#2-supabase-placeholder-workaround)
3. [Supabase Setup — ✅ COMPLETE](#3-supabase-setup--complete)
4. [How To Restore Real Supabase Connection](#4-how-to-restore-real-supabase-connection)
5. [Adding More Real-Time Payment Apps](#5-adding-more-real-time-payment-apps)
6. [Offer Expiry & Auto-Rotation Strategy](#6-offer-expiry--auto-rotation-strategy)
7. [Full File Map](#7-full-file-map)
8. [Build Status](#8-build-status)
9. [Remaining Work](#9-remaining-work)

---

## 1. What's Been Built

### Pages (All Rendering Clean — 200 OK)

| Route | Type | Description |
|-------|------|-------------|
| `/` | Static | Homepage — hero, stats, features, how it works, categories, CTA |
| `/offers` | Static | Offer dashboard with 6 demo offers, sidebar filters (category + payment app) |
| `/recommend` | Static | "Best Way to Pay" — enter merchant + amount, get ranked payment recommendations |
| `/submit` | Static | Community offer submission form (merchant, app, cashback, promo code, etc.) |
| `/login` | Dynamic | Login page — Google OAuth + Email Magic Link |
| `/signup` | Dynamic | Sign-up page — Google OAuth + Email Magic Link |
| `/savings` | Dynamic | My Savings dashboard (auth-gated) |
| `/admin` | Dynamic | Admin panel (role-gated, email whitelist) |
| `/extension` | Static | Chrome Extension coming soon page |
| `/auth/callback` | Dynamic | Supabase OAuth callback handler (exchanges code for session) |

### API Routes

| Endpoint | Method | Description | Rate Limit |
|----------|--------|-------------|------------|
| `/api/offers` | GET | Filtered + paginated offer listing with Zod validation | 60/min (IP) |
| `/api/recommend` | POST | Recommendation engine — takes merchant + amount, returns ranked offers by savings | 60/min (IP) |
| `/api/submit` | POST | Authenticated offer submission (requires login) | 20/min (User) |
| `/api/waitlist` | POST | Waitlist email signup | 5/min (IP) |
| `/api/savings/track` | POST | Log a saving event (auth + rate-limited) | 20/min (User) |
| `/api/savings/stats` | GET | Get savings stats (auth + rate-limited) | 30/min (User) |
| `/api/admin/offers` | POST | Admin: create/manage offers | Admin only |
| `/api/admin/submissions` | GET/PATCH | Admin: review community submissions | Admin only |

### Infrastructure

- **Next.js 16.1.6** (App Router, Turbopack, TypeScript strict)
- **Tailwind CSS v4 + shadcn/ui** (14 components: button, card, input, badge, separator, sheet, dialog, dropdown-menu, select, textarea, sonner, tabs, avatar, label)
- **Supabase** (@supabase/supabase-js v2.95.3, @supabase/ssr v0.8.0) — **Connected ✅**
- **Zod v4** for all input validation
- **react-hook-form** with @hookform/resolvers
- **Rate limiting** on all API routes (in-memory, 4 presets)
- **Admin RBAC** — email whitelist + service role client
- **Proxy (middleware)** — refreshes Supabase auth session on every request
- **Complete SQL schema** with 10 categories, 9 payment apps, 15 merchants, 6 sample offers

---

## 2. Supabase Placeholder Workaround

### The Problem

The `.env.local` file originally had **placeholder values** (not real Supabase credentials).

The Supabase SDK (`@supabase/ssr`) **crashes** if you pass an invalid URL to `createBrowserClient()` or `createServerClient()`. It throws:

```
Error: Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.
```

### What I Changed (3 Files)

#### File 1: `src/lib/supabase/client.ts` (Browser Client)

Checks if credentials are real, falls back to a dummy URL that won't crash:
```ts
const isConfigured = SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 0;
```

#### File 2: `src/lib/supabase/server.ts` (Server Client)

Same pattern — checks `isConfigured`, uses placeholder URL if not.

#### File 3: `src/lib/supabase/middleware.ts` (Proxy/Middleware Helper)

Same pattern, but also **skips the entire session refresh** if not configured.

### Status: ✅ Real credentials are now set — `isConfigured` checks pass automatically.

---

## 3. Supabase Setup — ✅ COMPLETE

> All Supabase setup tasks completed on **19 February 2026**.

- [x] Set real `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- [x] Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- [x] Run `supabase/schema.sql` in Supabase SQL Editor
- [x] Run `supabase/migrations/002_user_savings.sql` in Supabase SQL Editor
- [x] Enable Google OAuth provider in Supabase Auth settings
- [x] Database connected and operational

---

## 4. How To Restore Real Supabase Connection

**No longer needed — Supabase is connected.** The `isConfigured` checks remain in the code as a safety net but are now passing with real credentials.

---

## 5. Adding More Real-Time Payment Apps

### Currently Supported (9 Apps)

Defined in `src/lib/constants.ts` → `PAYMENT_APPS` array:

| App | Slug | Brand Color |
|-----|------|-------------|
| PhonePe | phonepe | #5F259F |
| Google Pay | googlepay | #4285F4 |
| Paytm | paytm | #00BAF2 |
| Amazon Pay | amazonpay | #FF9900 |
| CRED | cred | #1A1A2E |
| WhatsApp Pay | whatsapppay | #25D366 |
| BHIM | bhim | #00838F |
| Samsung Pay | samsungpay | #1428A0 |
| MobiKwik | mobikwik | #E23744 |

### Also Seeded in Database (`supabase/schema.sql`)

Same 9 apps are inserted into the `payment_apps` table with logos and UPI support flags.

### How To Add More Apps

**Three places to update:**

#### 1. Constants file (`src/lib/constants.ts`)

Add to the `PAYMENT_APPS` array:

```ts
{ name: "Freecharge", slug: "freecharge", color: "#8E24AA" },
{ name: "JioFinancial", slug: "jiofinancial", color: "#0A3D62" },
{ name: "Slice", slug: "slice", color: "#6C63FF" },
{ name: "Fi Money", slug: "fimoney", color: "#00D09C" },
{ name: "Jupiter", slug: "jupiter", color: "#5E35B1" },
{ name: "Navi", slug: "navi", color: "#FF6F00" },
```

#### 2. Database seed (`supabase/schema.sql` or run INSERT directly)

```sql
INSERT INTO payment_apps (name, slug, logo_url, color, supports_upi) VALUES
  ('Freecharge', 'freecharge', NULL, '#8E24AA', true),
  ('JioFinancial', 'jiofinancial', NULL, '#0A3D62', true),
  ('Slice', 'slice', NULL, '#6C63FF', true),
  ('Fi Money', 'fimoney', NULL, '#00D09C', true),
  ('Jupiter', 'jupiter', NULL, '#5E35B1', true),
  ('Navi', 'navi', NULL, '#FF6F00', true);
```

#### 3. Offer filters UI (`src/components/offers/offer-filters.tsx`)

This component auto-reads from `PAYMENT_APPS` constant, so **no change needed there** — it picks up new apps automatically.

---

## 6. Offer Expiry & Auto-Rotation Strategy

### Current Implementation

#### Database Level — Auto-Expiry

The SQL schema already has a function that runs periodically:

```sql
CREATE OR REPLACE FUNCTION expire_old_offers()
RETURNS void AS $$
BEGIN
  UPDATE offers
  SET status = 'expired'
  WHERE valid_to < NOW()
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;
```

All queries in the service layer filter by:
```sql
.eq("status", "active")
.gte("valid_to", new Date().toISOString())
```

So expired offers are **automatically excluded** from all API responses.

### Planned Enhancements

- **Supabase pg_cron** — run `expire_old_offers()` every hour
- **Supabase Realtime** — live offer refresh on the client
- **"Ending Soon" badges** — urgency indicators on offer cards
- **Push notifications** — alert users when better offers appear

---

## 7. Full File Map

```
paywise/
├── .env.local                          ← Supabase + Groq credentials ✅ CONFIGURED
├── next.config.ts                      ← Next.js config (turbopack root set)
├── package.json                        ← Dependencies
├── CEO_TASKS.md                        ← Bhanu's 7 action items (data, testing, revenue)
├── CTO_PLAN.md                         ← Technical build plan (7 builds, RAG architecture)
├── VISION.md                           ← 12-section company vision document
├── supabase/
│   ├── schema.sql                      ← Complete DB schema + seed data ✅ RUN
│   └── migrations/
│       ├── 002_user_savings.sql        ← User savings tracking ✅ RUN
│       ├── RUN_THIS_NEXT.sql           ← AI system tables (7 tables) ✅ RUN
│       ├── 004_knowledge_tables.sql    ← Knowledge DB tables + freshness metadata ✅ RUN
│       ├── 005_smart_retrieval.sql     ← Hybrid retrieval (FTS + vector) ✅ RUN
│       ├── 006_user_transactions_import_alignment.sql ← Compatibility alignment ✅ RUN (existing DBs)
│       └── 007_event_outbox.sql        ← Event-driven queue foundation ✅ RUN
├── src/
│   ├── proxy.ts                        ← Auth session refresh
│   ├── app/
│   │   ├── layout.tsx                  ← Root layout (Navbar + Footer + Toaster)
│   │   ├── page.tsx                    ← Homepage
│   │   ├── login/page.tsx              ← Login page
│   │   ├── signup/page.tsx             ← Signup page
│   │   ├── offers/page.tsx             ← Offer dashboard
│   │   ├── recommend/page.tsx          ← "Best Way to Pay"
│   │   ├── submit/page.tsx             ← Submit an offer
│   │   ├── savings/page.tsx            ← My Savings dashboard
│   │   ├── ask/page.tsx                ← "Ask PayWise" AI chat (8 quick actions, insights)
│   │   ├── dashboard/page.tsx          ← Personal finance dashboard
│   │   ├── admin/page.tsx              ← Admin panel
│   │   ├── extension/page.tsx          ← Chrome Extension coming soon
│   │   ├── auth/callback/route.ts      ← OAuth callback
│   │   └── api/
│   │       ├── offers/route.ts         ← GET offers
│   │       ├── recommend/route.ts      ← POST recommendations
│   │       ├── submit/route.ts         ← POST offer submission
│   │       ├── waitlist/route.ts       ← POST waitlist signup
│   │       ├── savings/
│   │       │   ├── track/route.ts      ← POST log a saving event
│   │       │   └── stats/route.ts      ← GET savings stats
│   │       ├── ai/
│   │       │   ├── chat/route.ts       ← POST AI chat (Groq + knowledge injection)
│   │       │   └── insights/route.ts   ← GET proactive insights (5 types)
│   │       ├── transactions/
│   │       │   ├── route.ts            ← GET/POST transactions
│   │       │   └── import/route.ts     ← POST SMS/statement parser (80+ patterns)
│   │       ├── analytics/spending/     ← GET spending analytics
│   │       ├── profile/route.ts        ← GET/PATCH user profile
│   │       ├── data/
│   │       │   ├── export/route.ts     ← GET data export (DPDP)
│   │       │   └── delete/route.ts     ← DELETE right to erasure (DPDP)
│   │       └── admin/
│   │           ├── offers/route.ts     ← Admin: create/manage offers
│   │           └── submissions/route.ts ← Admin: review submissions
│   ├── components/
│   │   ├── auth/                       ← Login + signup forms
│   │   ├── layout/                     ← Navbar, footer, marquee
│   │   ├── offers/                     ← Offer card + filters + promo copy button
│   │   ├── recommend/                  ← Recommendation form
│   │   ├── submit/                     ← Submit offer form
│   │   ├── savings/                    ← Savings counter, tracker, history
│   │   ├── admin/                      ← Admin dashboard, offer table, submissions
│   │   └── ui/                         ← 14 shadcn/ui components
│   ├── lib/
│   │   ├── constants.ts                ← App name, categories, payment apps, nav links
│   │   ├── env.ts                      ← Typed env var helpers
│   │   ├── utils.ts                    ← cn() utility
│   │   ├── validations.ts             ← All Zod schemas
│   │   ├── rate-limit.ts              ← In-memory rate limiter
│   │   ├── admin-auth.ts              ← verifyAdmin() helper
│   │   ├── ai/
│   │   │   ├── gemini.ts              ← chatWithGroq(), chatWithPayWise(), quickAsk()
│   │   │   ├── prompts.ts             ← Domain-expert system prompt
│   │   │   ├── context-builder.ts     ← buildUserContext(userId, userQuery?)
│   │   │   ├── query-analyzer.ts      ← analyzeQuery() — 15 intents
│   │   │   └── knowledge/
│   │   │       ├── credit-cards.ts    ← 14 cards with rewards, fees, affiliates
│   │   │       ├── upi-apps.ts        ← 6 UPI apps with market share
│   │   │       └── payment-strategies.ts ← 7 stacking strategies
│   │   ├── security/audit.ts          ← Audit logging (DPDP compliance)
│   │   └── supabase/                   ← Browser, server, middleware, admin clients
│   ├── services/
│   │   ├── offers.ts                   ← Offer CRUD services
│   │   ├── lookups.ts                  ← Categories, merchants, payment apps
│   │   ├── profiles.ts                ← User profile + pro status + AI usage
│   │   └── transactions.ts            ← Transaction CRUD + analytics
│   └── types/
│       ├── database.ts                 ← All DB types
│       ├── api.ts                      ← API response types
│       └── index.ts                    ← Type barrel exports
```

---

## 8. Build Status

```
✅ npm run build — PASSES (33 routes, 0 errors, 0 warnings)
✅ npm run dev   — All pages serve 200 OK
✅ TypeScript    — Strict mode, no errors
✅ Supabase      — Connected and operational
✅ Groq API      — Connected (Llama 3.3 70B Versatile)
```

---

## 9. Remaining Work

### 🔴 NEXT UP — AI Architecture Pivot (CTO builds, see CTO_PLAN.md)
1. [ ] **Admin Panel for Knowledge Management** — Web UI to add/edit/delete cards, offers, strategies without code deploy
2. [ ] **DB Migration** — Move hardcoded TypeScript knowledge → Supabase tables with `last_verified_date`
3. [ ] **Vector Search (RAG)** — Supabase pgvector for semantic retrieval instead of regex matching
4. [ ] **Smart Onboarding** — "What cards/apps do you use?" flow for personalized AI answers
5. [ ] **Razorpay Integration** — Pro subscription (₹99/mo) when Bhanu shares API keys
6. [ ] **Affiliate Link Tracking** — Revenue from card recommendations

### 🔴 CEO TASKS (Bhanu does, see CEO_TASKS.md)
1. [ ] Test AI with 10 specific questions, document failures
2. [ ] Collect live offers from 5 apps (Swiggy, Zomato, Amazon, Flipkart, bill pay)
3. [ ] Verify top 20 credit card details from bank websites
4. [ ] Competitor testing (CRED, CashKaro, CardExpert, CouponDunia, BankBazaar)
5. [ ] Set up Razorpay account + affiliate programs
6. [ ] Recruit 50 beta users

### ✅ Completed - Knowledge Engine & AI Overhaul (March 5, 2026)
- [x] 3 knowledge modules (14 cards, 6 UPI apps, 7 stacking strategies)
- [x] Query analyzer (15 intents, 35+ merchant patterns, entity extraction)
- [x] Domain-expert prompt rewrite
- [x] Context builder with knowledge injection
- [x] Transaction import API (80+ merchant patterns)
- [x] Proactive insights API (5 types)
- [x] Ask page UI overhaul (8 quick actions, insights feed)
- [x] CEO_TASKS.md + CTO_PLAN.md + VISION.md created
- [x] Token limit: 1024 → 2048

### ✅ Completed - PayWise AI Foundation (March 4, 2026)
- [x] Groq API integration (Llama 3.3 70B Versatile)
- [x] System prompt engineering + safety settings
- [x] Context builder (profile + spending + savings)
- [x] Chat API with usage limits + conversation persistence
- [x] Dashboard with spending analytics
- [x] 7 new DB tables (profiles, transactions, conversations, offer matches, audit, consent, usage)
- [x] DPDP compliance (data export + deletion APIs)

### ✅ Completed - Supabase Setup (Feb 19, 2026)
- [x] Real Supabase credentials configured
- [x] All SQL schemas and migrations run
- [x] Google OAuth enabled

### ✅ Completed - Tier 1 Features (Feb 16, 2026)
- [x] Savings Counter System (DB + API + UI + dashboard)
- [x] Admin Panel (dashboard + offer management + submission review)
- [x] Security Hardening (rate limiting + Zod + RLS + IDOR + RBAC)

### 🔲 Testing
- [ ] Test login/signup flow end-to-end
- [ ] Test AI chat accuracy (CEO Task 3)
- [ ] Test savings tracking flow
- [ ] Test admin panel CRUD operations

### Future Features (Deprioritized — Focus on RAG First)
- [ ] "Deal Dying" Push Alerts (Resend + Web Push)
- [ ] "Offer Stacking" Calculator (interactive UI)
- [ ] Weekly Savings Report Email (React Email + cron)
- [ ] Chrome Extension
- [ ] Gamification: Savings Streaks
- [ ] Community Trust System
- [ ] Receipt Scanner
- [ ] Smart Bill Pay

---

*This file is the single source of truth for session continuity. Update it after each major milestone.*


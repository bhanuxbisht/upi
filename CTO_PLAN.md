# CTO Technical Plan — What The AI Co-Founder Will Build

> **This document explains WHAT I (the CTO) will build, WHY each piece matters, and HOW it transforms PayWise from a prompt-engineering chatbot into a real AI financial assistant.**
>
> Written so Bhanu (CEO) can understand every decision without needing to know the code.
>
> **Last updated:** 14 March 2026

---

## CURRENT STATUS: PHASE 1 IS CODE-COMPLETE

### What's Done ✅

| Build | Status | What It Does |
|---|---|---|
| Admin Knowledge APIs | ✅ Done | CRUD for credit cards, UPI apps, strategies with Zod validation |
| DB-First Knowledge | ✅ Done | Calculator reads from Supabase, falls back to TypeScript |
| Smart RAG Search | ✅ Done | Hybrid full-text + vector search for relevant knowledge |
| Freshness Metadata | ✅ Done | Every AI response includes data source and confidence |
| Event Outbox | ✅ Done (producer) | Mutations emit events for future async processing |
| Transaction Enhancement | ✅ Done | `description`, `source`, date parsing improvements |
| Stale Offer Guardrails | ✅ Done | Filters out old, unverified offers from recommendations |

### What's Remaining (Immediate)

| Build | Priority | Blocker |
|---|---|---|
| Admin Panel UI | P1 | None — just need to build it |
| Event Consumer Worker | P1 | Need CEO to pick approach (Vercel Cron recommended) |
| Fix 13 Bugs (see below) | P1 | None |
| Knowledge Cache Layer | P1 | None |
| Smart Onboarding Flow | P2 | Need CEO's speaking profiles (Task 5C) |

---

## THE CORE PROBLEM I SOLVED

Our AI **was** a text reformatter:
```
User asks → Regex matches keyword → Dump ALL hardcoded data → LLM reformats → Response
```

Now it's a **real intelligence system**:
```
User asks → Intent detected → Calculator computes exact ₹ → RAG finds relevant data only → LLM explains with verified numbers → Response with confidence metadata
```

---

## BUILDS COMPLETED

### BUILD 1: Admin Knowledge APIs ✅
- Created REST endpoints at `/api/admin/knowledge/{credit-cards,upi-apps,strategies}`
- Full **Zod schema validation** with field limits, type constraints, nullable handling
- `last_verified_date` resolution: explicit value > existing DB value > now()
- Upsert with `onConflict: "id"` — update if exists, insert if new
- Event outbox integration — every mutation publishes an event
- DELETE with 404 handling — returns deleted record for confirmation

### BUILD 2: Database-First Knowledge ✅
- `knowledge-service.ts` fetches live data from Supabase tables
- Graceful fallback: if DB empty or unavailable → use TypeScript files
- Payment calculator now accepts **DB data** as input (not hardcoded imports)
- Freshness snapshot function for trust metadata

### BUILD 3: Smart RAG (Hybrid Search) ✅
- Full-text search via PostgreSQL `tsvector` (keyword matching)
- Vector search via `pgvector` (semantic matching — "eating out" finds "food-delivery")
- Hybrid merge with relevance boosting (found in both → higher score)
- Falls back to intent-based fetch-all if search returns nothing

### BUILD 4: Event Outbox System ✅ (Producer Only)
- `event_outbox` table with status tracking, retry logic, idempotency keys
- `publishOutboxEvent()` utility used by all admin routes and transaction creation
- Postgres unique constraint prevents duplicate events
- **Consumer worker not yet built** — events are queued but unprocessed

### BUILD 5: Freshness & Trust Layer ✅
- Every knowledge item has `last_verified_date`, `confidence_level`, `source_url`
- Recommendation API filters stale (>45 days) + unverified offers
- AI chat response includes `knowledgeFreshness` metadata

---

## BUGS TO FIX (13 Found in Full Audit)

### 🔴 Critical (Code Errors / Dead Code)

| # | Bug | File | Fix |
|---|---|---|---|
| 1 | `getCardRecommendation` imported but never used | `query-analyzer.ts:14` | Remove import |
| 2 | `getStrategiesForApps` imported but never used | `query-analyzer.ts:16` | Remove import |
| 3 | `quickAsk()` exported, never imported anywhere | `gemini.ts:262` | Keep for future use |
| 4 | `isAIConfigured()` exported, never used | `gemini.ts:273` | Use in frontend or remove |
| 5 | `src/lib/env.ts` — entire file never imported | 39 lines dead | Delete or integrate |
| 6 | `src/proxy.ts` — entire file never imported | 21 lines dead | Delete |
| 7 | `isEmbeddingConfigured()` — never used + always returns true | `embedding-service.ts:170` | Fix or delete |

### 🟡 Medium (Logic / Performance)

| # | Bug | File | Fix |
|---|---|---|---|
| 8 | Insights API uses hardcoded knowledge, not DB | `ai/insights/route.ts` | Switch to knowledge-service imports |
| 9 | 3 unconditional DB queries per AI message | `context-builder.ts:215` | Conditional fetch by intent |
| 10 | Rate limiter is in-memory (breaks on serverless) | `rate-limit.ts` | Use Upstash Redis later |
| 11 | `knowledgeFreshness` leaked in API response | `ai/chat/route.ts:197` | Sanitize or remove |
| 12 | Offer outbox keys missing timestamps | `admin/offers/route.ts` | Add `${Date.now()}` |
| 13 | Indentation error in payment-calculator.ts | `payment-calculator.ts:225` | Fix whitespace |

### Fix Priority
- Bugs 1-7: Fix NOW (10 minutes of work, removes 137 lines of dead code)
- Bugs 8-9: Fix THIS WEEK (performance + correctness)
- Bugs 10-12: Fix BEFORE LAUNCH
- Bug 13: Cosmetic, fix anytime

---

## WHAT I WILL BUILD NEXT (In Order)

### NEXT BUILD: Clean Up + Performance (Next Session)
1. Delete dead code (env.ts, proxy.ts, unused imports)
2. Fix insights API to use DB knowledge
3. Add conditional DB fetching in context-builder
4. Add 5-minute in-memory cache for knowledge data
5. Fix offer idempotency keys
6. Sanitize knowledgeFreshness in response

### BUILD: Admin Panel UI
**Timeline:** Session after cleanup
**What it does:**
- Web UI at `/admin/knowledge` for Bhanu to manage:
  - Credit cards (add/edit/deactivate, see last verified date)
  - UPI apps (market share, reward tiers, strategies)
  - Strategies (steps, requirements, savings range)
  - Live offers (create, expire, track verifications)
- Bulk import from CSV/JSON
- Search and filter across all knowledge

### BUILD: Event Consumer Worker
**Timeline:** After CEO picks approach (Vercel Cron recommended)
**What it does:**
- Polls `event_outbox` for pending events every 5 minutes
- Processes events:
  - `transaction.created` → update spending analytics, check missed savings
  - `offer.created` → generate embeddings, index for search
  - `knowledge.*.upserted` → regenerate embeddings, expire old cache
- Moves processed events to `completed`, failed to `dead-letter`
- Dead letter alerting (email or Slack webhook)

### BUILD: Smart Onboarding
**Timeline:** After Admin Panel
**What it does:**
1. New user lands on `/ask` → asked 3 quick questions:
   - "Which payment apps do you use?" (multi-select)
   - "Do you have any credit cards?" (add bank + card name)
   - "What's your biggest spending category?" (single select)
2. Profile auto-created → AI immediately personalizes responses
3. No profile = generic advice; with profile = "Use YOUR SBI Cashback card for..."

### BUILD: Razorpay Pro Integration
**Timeline:** After Bhanu provides API keys
**What it does:**
- `/pricing` page comparing Free vs Pro
- Checkout flow via Razorpay
- Webhook handler for payment confirmation
- Update `user_profiles.pro_user` and `pro_expires_at`
- Upgrade prompts when Free user hits daily limit

### BUILD: Affiliate Link Tracking
**Timeline:** After Pro integration
**What it does:**
- Every card recommendation includes affiliate link if available
- Click tracking → `affiliate_clicks` table
- Monthly dashboard showing clicks → applications → revenue
- Auto-insert affiliate links from knowledge DB into AI responses

---

## TECHNOLOGY DECISIONS LOG

| Decision | Why | Date |
|---|---|---|
| Groq over OpenAI | Free tier, fast inference, Llama 3.3 quality | March 2 |
| Supabase over Firebase | Real SQL, RLS, pgvector support | March 1 |
| RAG over Fine-tuning | Cheaper, faster to iterate, data changes daily | March 5 |
| Zod over manual validation | Type-safe, composable, auto-error messages | March 14 |
| Event Outbox over direct processing | Decoupled, retry-safe, doesn't block main flow | March 14 |
| HuggingFace over OpenAI embeddings | Free, 384-dim, good enough for our data size | March 6 |
| In-memory cache over Redis | Zero cost for MVP, upgrade when needed | March 14 |

---

## METRICS I'LL TRACK

| Metric | Goal | How |
|---|---|---|
| AI response accuracy | >90% correct on 100 Q&A pairs | CEO's evaluation dataset (Task 5A) |
| Response time P95 | <2.5s text, <4s image | Server-side logging |
| Knowledge freshness | >80% items verified in last 30 days | Freshness snapshot API |
| Offer reliability | >70% offers confirmed working | User verification count |
| User retention | >30% weekly active return | Supabase analytics |
| Revenue per user | ₹5-15/month (Pro + affiliates) | Razorpay dashboard |

---

*This plan is executed alongside CEO_TASKS.md. The CTO builds the engine; the CEO provides the fuel (data, testing, relationships). Both are equally critical.*

*— CTO / Technical Co-Founder*
*14 March 2026*

# PayWise — System Architecture & Scale Blueprint

> **Version:** 1.0 — 14 March 2026
> **Author:** CTO / AI Co-Founder
> **Audience:** CEO (Bhanu), Investors, Future Engineering Team

---

## 1. SYSTEM OVERVIEW

PayWise is an AI-powered financial assistant for Indian digital payments. It answers ONE question: **"Am I paying more than I should?"** — and the answer is almost always yes.

### Architecture Philosophy
```
User Query → Entity Extraction → Verified Data Retrieval → Deterministic Calculator → LLM Formatting → Actionable Response
```

The LLM is the LAST step, not the first. It NEVER guesses numbers — it only formats pre-calculated, verified results into natural language.

---

## 2. HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                       │
│  /ask   /offers   /recommend   /dashboard   /admin   /savings   │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────────────┐
│                   API LAYER (Next.js Routes)                     │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────────┐   │
│  │ Auth    │ │ Rate     │ │ Zod       │ │ Audit Logging    │   │
│  │ Guard   │ │ Limiter  │ │ Validator │ │ (DPDP Act)       │   │
│  └─────────┘ └──────────┘ └───────────┘ └──────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    AI INTELLIGENCE LAYER                         │
│                                                                  │
│  ┌─────────────────┐    ┌────────────────────┐                  │
│  │ Query Analyzer   │───▶│ Context Builder     │                 │
│  │ (Intent + Entity │    │ (3 retrieval layers │                 │
│  │  extraction)     │    │  + user context)    │                 │
│  └─────────────────┘    └────────┬───────────┘                  │
│                                  │                               │
│  ┌──────────────────────────────▼──────────────────────────┐    │
│  │            RETRIEVAL HIERARCHY (Best → Fallback)         │    │
│  │                                                          │    │
│  │  Layer 0: Deterministic Calculator (pure math)           │    │
│  │           ↓ (if merchant + amount detected)              │    │
│  │  Layer 1: Smart RAG (vector + full-text hybrid search)   │    │
│  │           ↓ (if search returns no results)               │    │
│  │  Layer 2: Intent-based DB Fetch (fetch-all, filter)      │    │
│  │           ↓ (if DB unavailable)                          │    │
│  │  Layer 3: TypeScript Hardcoded Fallback (always works)   │    │
│  └──────────────────────────────┬──────────────────────────┘    │
│                                  │                               │
│  ┌──────────────────────────────▼──────────────────────────┐    │
│  │               LLM (Groq / Gemini)                        │    │
│  │  - Receives: Calculated ₹ numbers + Verified data        │    │
│  │  - Does: Formats into natural language response           │    │
│  │  - Does NOT: Calculate, guess, or invent numbers          │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    DATA LAYER (Supabase)                          │
│                                                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐    │
│  │ Knowledge DB  │ │ User Data    │ │ Event Outbox         │    │
│  │ - credit_cards│ │ - profiles   │ │ (async processing)   │    │
│  │ - upi_apps   │ │ - txns       │ │                      │    │
│  │ - strategies  │ │ - savings    │ │ ┌──────────────────┐ │    │
│  │ - offers     │ │ - convos     │ │ │ Consumer Worker   │ │    │
│  │              │ │ - usage      │ │ │ (Vercel Cron)     │ │    │
│  └──────────────┘ └──────────────┘ │ └──────────────────┘ │    │
│                                     └──────────────────────┘    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Security: RLS on all tables │ Audit logs │ Consent mgmt  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. COMPLETE FILE INVENTORY & OWNERSHIP

### AI Intelligence Layer (8 files, ~2,975 lines)

| File | Lines | Purpose | Status |
|---|---|---|---|
| `src/lib/ai/gemini.ts` | 278 | LLM client (Groq active, Gemini ready) | ✅ Production |
| `src/lib/ai/prompts.ts` | 130 | System prompt + task-specific prompts | ✅ Production |
| `src/lib/ai/query-analyzer.ts` | 654 | Intent detection + entity extraction + TypeScript knowledge injection | ✅ Production |
| `src/lib/ai/payment-calculator.ts` | 420 | Deterministic ₹ calculator (pure math, no LLM) | ✅ Production |
| `src/lib/ai/context-builder.ts` | 412 | Builds complete AI context (user + knowledge + calculator) | ✅ Production |
| `src/lib/ai/knowledge-service.ts` | 773 | DB-first knowledge retrieval, hybrid search, freshness | ✅ Production |
| `src/lib/ai/embedding-service.ts` | 176 | HuggingFace vector embeddings for semantic search | ✅ Production |
| `src/lib/ai/knowledge/*.ts` | 4 files | Hardcoded fallback data (credit cards, UPI apps, strategies) | ✅ Fallback |

### API Routes (21 files, ~2,100 lines)

| Route | Methods | Auth Required | Rate Limited | Status |
|---|---|---|---|---|
| `/api/ai/chat` | POST | ✅ | 10/min | ✅ Production |
| `/api/ai/insights` | GET | ✅ | 20/min | ✅ Production |
| `/api/recommend` | POST | ❌ (IP-based) | 60/min | ✅ Production |
| `/api/transactions` | GET, POST | ✅ | 30r/20w per min | ✅ Production |
| `/api/transactions/import` | POST | ✅ | Yes | ✅ Production |
| `/api/analytics/spending` | GET | ✅ | 20/min | ✅ Production |
| `/api/savings/track` | POST | ✅ | 20/min | ✅ Production |
| `/api/savings/stats` | GET | ✅ | Yes | ✅ Production |
| `/api/offers` | GET | ❌ | ❌ | ⚠️ No rate limit |
| `/api/profile` | GET, PATCH | ✅ | Yes | ✅ Production |
| `/api/submit` | POST | ✅ | Yes | ✅ Production |
| `/api/waitlist` | POST | ❌ | Yes | ✅ Production |
| `/api/data/export` | GET | ✅ | Yes | ✅ DPDP |
| `/api/data/delete` | DELETE | ✅ | Yes | ✅ DPDP |
| `/api/admin/offers` | GET,POST,DELETE | ✅ Admin | No | ✅ Production |
| `/api/admin/submissions` | GET, PATCH | ✅ Admin | No | ✅ Production |
| `/api/admin/knowledge/*` | GET,POST,DELETE | ✅ Admin | No | ✅ Production |

### Services Layer (5 files, ~725 lines)

| File | Purpose | Status |
|---|---|---|
| `src/services/transactions.ts` | CRUD + Analytics for user transactions | ✅ Production |
| `src/services/profiles.ts` | Profile mgmt, Pro/Free tier, AI usage limits, DPDP | ✅ Production |
| `src/services/offers.ts` | Offer queries, merchant matching, trending | ✅ Production |
| `src/services/lookups.ts` | Categories, merchants, payment apps | ✅ Production |
| `src/services/index.ts` | Barrel exports | ✅ Production |

### Infrastructure (12 files, ~575 lines)

| File | Purpose | Status |
|---|---|---|
| `src/lib/rate-limit.ts` | In-memory sliding window rate limiter | ⚠️ Single-instance only |
| `src/lib/validations.ts` | Zod schemas for public API inputs | ✅ Production |
| `src/lib/constants.ts` | App-wide constants, admin whitelist, nav | ✅ Production |
| `src/lib/admin-auth.ts` | Admin verification + service role client | ✅ Production |
| `src/lib/env.ts` | Typed environment variables | ⚠️ Unused (see bugs) |
| `src/lib/utils.ts` | Tailwind `cn()` utility | ✅ Standard |
| `src/lib/security/audit.ts` | DPDP Act audit logging | ✅ Production |
| `src/lib/events/outbox.ts` | Transactional outbox for async events | ⚠️ No consumer |
| `src/lib/supabase/server.ts` | SSR Supabase client | ✅ Production |
| `src/lib/supabase/admin.ts` | Service role client (bypasses RLS) | ✅ Production |
| `src/lib/supabase/client.ts` | Browser Supabase client | ✅ Production |
| `src/lib/supabase/middleware.ts` | Session refresh middleware | ✅ Production |

---

## 4. BUGS FOUND (Line-by-Line Audit)

### 🔴 BUG 1: `getCardRecommendation` — Imported but Never Called

**File:** `src/lib/ai/query-analyzer.ts` (line 14)
```typescript
import { getCardRecommendation, ... } from "./knowledge";
```
`getCardRecommendation` is imported but never used anywhere in `query-analyzer.ts`. It's exported from `knowledge/credit-cards.ts` and re-exported from `knowledge/index.ts`, but the only consumer is this dead import.

**Impact:** Dead code. No runtime impact but adds to bundle size and confusion.
**Fix:** Remove the import.

### 🔴 BUG 2: `getStrategiesForApps` — Imported but Never Called

**File:** `src/lib/ai/query-analyzer.ts` (line 16)
```typescript
import { getStrategiesForApps, ... } from "./knowledge";
```
Same as above — imported, never used in any function in this file.

**Impact:** Dead code.
**Fix:** Remove the import.

### 🔴 BUG 3: `quickAsk` and `isAIConfigured` — Exported, Never Used

**File:** `src/lib/ai/gemini.ts` (lines 262, 273)
```typescript
export async function quickAsk(...) { ... }
export function isAIConfigured(): boolean { ... }
```
Both functions are exported but never imported anywhere in the codebase.

**Impact:** Dead code. `quickAsk` works correctly but nobody calls it. `isAIConfigured` is a useful utility that should be used but isn't.
**Fix:** Keep `isAIConfigured()` — it SHOULD be used to gate AI features in the frontend. Remove `quickAsk` or mark it as `@internal`.

### 🔴 BUG 4: `src/lib/env.ts` — Entire File is Dead Code

**File:** `src/lib/env.ts` (39 lines)
This file provides typed environment variable access (`env.supabase.url`, `env.googleAI.apiKey`, etc.) but **no file in the codebase imports it**. Every file accesses `process.env` directly instead.

**Impact:** 39 lines of dead code. Also means env validation happens nowhere — if a key is missing, it fails at runtime instead of at startup.
**Fix:** Either delete it, or actually use it everywhere (recommended — this is better than raw `process.env`).

### 🔴 BUG 5: `src/proxy.ts` — Dead File, Never Imported

**File:** `src/proxy.ts` (21 lines)
Exports a `proxy()` function and `config` matcher, but no file imports it. This was likely intended to be the Next.js middleware but was replaced by a proper `middleware.ts` at the project root.

**Impact:** Dead code.
**Fix:** Delete it, or rename to `middleware.ts` at root if the actual middleware is missing.

### 🔴 BUG 6: `isEmbeddingConfigured` — Never Used

**File:** `src/lib/ai/embedding-service.ts` (line 170)
```typescript
export function isEmbeddingConfigured(): boolean {
    return true; // Always returns true!
}
```
Not only is it never called, but it always returns `true` regardless of whether the HuggingFace API key is set. Misleading.

**Impact:** Dead code + misleading return value.
**Fix:** Remove, or fix the logic to check `HF_API_KEY.length > 0`.

### 🟡 BUG 7: `nanToUndefined` in `validations.ts` — Only Used Internally

**File:** `src/lib/validations.ts` (line 18)
```typescript
const nanToUndefined = z.number().transform(...)
```
This transform is only used within `offerSubmissionSchema` in the same file. It's not exported, which is correct — but it has a confusing variable name for a Zod transform. Not a bug, just worth noting.

### 🟡 BUG 8: Insights API Uses Hardcoded Knowledge, Not DB

**File:** `src/app/api/ai/insights/route.ts` (lines 17-21)
```typescript
import { getBestCardForMerchant, estimateMonthlySavings, getOptimalAppStack, SUBSCRIPTION_OPTIMIZATION } from "@/lib/ai/knowledge";
```
The insights API directly imports from the hardcoded TypeScript knowledge files, bypassing the entire DB-first knowledge-service. This means insights are based on STALE TypeScript data, not the live Supabase data.

**Impact:** Inconsistent data source. AI chat uses DB data, but insights use hardcoded data. Could give contradictory recommendations.
**Fix:** Import from `knowledge-service.ts` (getCreditCards, etc.) instead, matching how `context-builder.ts` works.

### 🟡 BUG 9: `context-builder.ts` — 3 Unconditional DB Queries Per AI Message

**File:** `src/lib/ai/context-builder.ts` (lines 215-219)
```typescript
const [liveCreditCards, liveUPIApps, liveStrategies] = await Promise.all([
    getCreditCards(), getUPIApps(), getStrategies(),
]);
```
These 3 DB queries fire on EVERY chat message regardless of intent. A "hello" message triggers 3 knowledge fetches. At scale, this is 15M unnecessary DB calls/day.

**Fix:** Only fetch when the intent needs it (wrap in conditionals based on `analysis.intent`).

### 🟡 BUG 10: Rate Limiter is In-Memory — Breaks on Multi-Instance

**File:** `src/lib/rate-limit.ts`
The rate limiter uses a `Map<string, ...>` in memory. On Vercel serverless, each function invocation gets a fresh memory space. This means rate limiting is essentially non-functional on Vercel.

**Impact:** Users can bypass rate limits by getting routed to different instances.
**Fix (future):** Use Upstash Redis or Supabase RPC for distributed rate limiting.

### 🟡 BUG 11: `knowledgeFreshness` Leaked in AI Chat Response

**File:** `src/app/api/ai/chat/route.ts` (line 197)
```typescript
return NextResponse.json({
    response: aiResponse.response,
    conversationId: activeConversationId,
    knowledgeFreshness, // ← Internal metadata exposed to frontend
    ...
});
```
**Impact:** Exposes data architecture details (fallback vs DB, confidence counts) to any client.
**Fix:** Remove from response or sanitize to `{ dataQuality: "high" | "medium" | "low" }`.

### 🟡 BUG 12: Offer Idempotency Keys Missing Timestamps

**File:** `src/app/api/admin/offers/route.ts`
```typescript
idempotencyKey: `offer:${offer.id}:created`   // No timestamp!
idempotencyKey: `offer:${deletedOffer.id}:deleted` // No timestamp!
```
If an offer is deleted and re-created with the same ID, the idempotency key collides with the old event.

**Fix:** Add `${Date.now()}` or `${offer.created_at}` to the key.

### 🟢 BUG 13: `payment-calculator.ts` Indentation Issue

**File:** `src/lib/ai/payment-calculator.ts` (line 225)
```typescript
    const topCard = options.find(o => !o.method.includes("UPI bonus") && !o.method.includes("scratch"));
const topUPI = options.find(o => o.method.includes("UPI bonus"));  // ← Wrong indentation
```
`topUPI` is at column 0 instead of being indented to match `topCard`. No functional impact but indicates a copy-paste error.

---

## 5. DEAD CODE SUMMARY

| File / Export | Lines | Action |
|---|---|---|
| `src/lib/env.ts` (entire file) | 39 | DELETE or integrate everywhere |
| `src/proxy.ts` (entire file) | 21 | DELETE |
| `getCardRecommendation` import | 1 | Remove from query-analyzer.ts |
| `getStrategiesForApps` import | 1 | Remove from query-analyzer.ts |
| `quickAsk()` export | 6 | KEEP (useful future API) |
| `isAIConfigured()` export | 5 | KEEP and actually use in frontend |
| `isEmbeddingConfigured()` export | 4 | DELETE or fix logic |
| Gemini code block (commented) | 65 | KEEP (future provider switch) |

**Total dead code: ~137 lines (2.3% of codebase)**

---

## 6. SCALE BLUEPRINT

### Current Capacity (Vercel Free → Pro)

| Metric | Current Limit | Production Target |
|---|---|---|
| AI queries/day | ~1,000 (Groq free) | 50,000+ |
| DB connections | 10 (Supabase free) | 100+ |
| API routes/sec | Serverless (cold starts) | <200ms P95 |
| Knowledge items | 20 cards + 6 apps (hardcoded) | 200+ cards, 20+ apps |
| Offers | ~50 stale | 500+ live, auto-expiring |
| Regions | Single | Multi-region CDN |

### Scale Phase 1: 1,000 Users (Month 1-2)
- Groq free tier (14,400 req/day)
- Supabase free tier (500MB, 50K rows)
- Vercel free tier (100GB bandwidth)
- **Cost: ₹0/month**

### Scale Phase 2: 10,000 Users (Month 3-6)
- Groq paid or Gemini Flash ($0.075/1M tokens)
- Supabase Pro ($25/month — 8GB, unlimited rows)
- Vercel Pro ($20/month — faster edge)
- Redis cache for rate limiting + knowledge (Upstash — $10/month)
- **Cost: ~₹5,000-8,000/month**

### Scale Phase 3: 100,000 Users (Month 6-12)
- Dedicated Gemini endpoint or self-hosted LLM
- Supabase Team ($599/month — connection pooling, backups)
- Vercel Team ($150/month — ISR, edge functions)
- Redis + CDN for offer data
- Event consumer worker (Vercel Cron → dedicated worker)
- **Cost: ~₹60,000-80,000/month**

### Scale Phase 4: 1M Users (Year 2)
- Fine-tuned model (PayWise-7B on Indian payment data)
- Multi-region Supabase with read replicas
- Kubernetes for dedicated AI inference
- Dedicated analytics pipeline (ClickHouse or BigQuery)
- Real-time offer ingestion from bank APIs
- **Cost: ~₹3-5 lakh/month** (offset by ₹10-30 lakh/month revenue)

---

## 7. FEATURE ROADMAP

### Phase 1: Foundation (NOW — March-April 2026) ✅ IN PROGRESS

| Feature | Status | Priority |
|---|---|---|
| AI chat with verified knowledge | ✅ Done | P0 |
| Deterministic payment calculator | ✅ Done | P0 |
| DB-first knowledge retrieval | ✅ Done | P0 |
| Smart RAG (hybrid search) | ✅ Done | P0 |
| Event outbox (producer) | ✅ Done | P1 |
| Freshness metadata in responses | ✅ Done | P1 |
| Zod validation on all admin routes | ✅ Done | P1 |
| Admin knowledge CRUD APIs | ✅ Done | P1 |
| Transaction import with date parsing | ✅ Done | P1 |
| Event consumer worker | ❌ TODO | P1 |
| Admin Panel UI | ❌ TODO | P1 |
| Fix dead code + bugs | ❌ TODO | P2 |

### Phase 2: Intelligence (April-May 2026)

| Feature | Description | Priority |
|---|---|---|
| Knowledge caching | 5-min in-memory TTL for card/app data | P0 |
| Conditional DB fetches | Only query knowledge relevant to intent | P0 |
| Proactive alerts | "You missed ₹80 on yesterday's Swiggy" | P1 |
| Screenshot/OCR input | Upload checkout page → instant recommendation | P1 |
| Smart onboarding | Ask 3 questions → build complete profile | P1 |
| Offer freshness auto-expire | Cron job marks stale offers as expired | P2 |

### Phase 3: Revenue (May-June 2026)

| Feature | Description | Priority |
|---|---|---|
| Razorpay Pro subscription | ₹99/month for unlimited queries + alerts | P0 |
| Affiliate link tracking | Earn ₹500-2000 per card application | P0 |
| Sponsored offers | Merchants pay for priority placement | P1 |
| Bank partnership API | Direct offer feeds from HDFC, SBI, ICICI | P2 |

### Phase 4: Scale (July+ 2026)

| Feature | Description | Priority |
|---|---|---|
| Voice assistant (Pro) | "Hey PayWise, best way to pay ₹500 at Swiggy" | P1 |
| Chrome extension | Auto-detect merchant on checkout page | P1 |
| WhatsApp bot | "Send ₹500 Swiggy" → get recommendation via WA | P2 |
| Fine-tuned model | PayWise-7B trained on Indian payment data | P2 |
| Bank statement auto-sync | UPI → auto-import transactions | P3 |

---

## 8. SECURITY ARCHITECTURE

| Layer | Implementation | Status |
|---|---|---|
| Authentication | Supabase Auth (email + OAuth) | ✅ |
| Authorization | RLS on all tables + Admin whitelist | ✅ |
| Input Validation | Zod schemas on all API routes | ✅ |
| Rate Limiting | In-memory sliding window | ⚠️ Single-instance |
| Audit Logging | DPDP Act compliant (fire-and-forget) | ✅ |
| Data Export | `/api/data/export` — full user data | ✅ |
| Data Deletion | `/api/data/delete` — cascading delete | ✅ |
| Consent Tracking | `consent_records` table | ✅ Schema ready |
| API Keys | `.env.local` (gitignored) | ✅ |
| SQL Injection | Supabase client parameterized queries | ✅ |
| XSS | Next.js auto-escaping + CSP headers | ✅ |

---

## 9. DATABASE SCHEMA

### Knowledge Tables (Admin-managed)
```
knowledge_credit_cards    — 25+ columns, RLS enabled, is_active flag
knowledge_upi_apps        — 20+ columns, RLS enabled, market_share ordering
knowledge_strategies      — 12+ columns, difficulty levels, savings ranges
offers                    — Live deals, auto-expiring, verification counts
```

### User Tables (RLS — users see only their own data)
```
user_profiles             — Payment preferences, cards, budget, Pro status
user_transactions         — Spending log with category + source tracking
user_savings              — Tracked savings events
user_savings_stats        — Aggregated stats (materialized)
ai_conversations          — Chat history with token usage
ai_usage                  — Daily query limits (Free: 3, Pro: unlimited)
```

### Platform Tables
```
merchants                 — Merchant registry + category mapping
categories                — Spending categories
payment_apps              — UPI app registry
event_outbox              — Async event queue (outbox pattern)
audit_logs                — DPDP compliance logging
consent_records           — User consent tracking
offer_submissions         — Community-submitted offers (pending review)
```

---

## 10. TECHNOLOGY CHOICES & REASONING

| Choice | Why | Alternatives Considered |
|---|---|---|
| **Next.js 15** | Full-stack, SSR, API routes, Vercel deployment | Express + React (more overhead) |
| **Supabase** | Postgres + Auth + RLS + Realtime — all-in-one | Firebase (worse SQL support), PlanetScale |
| **Groq (Llama 3.3 70B)** | Free tier, fast inference, good quality | OpenAI (expensive), Gemini (billing issues) |
| **Zod** | Runtime type validation, composable schemas | Yup (less TypeScript-native) |
| **HuggingFace Embeddings** | Free, 384-dim, good for semantic search | OpenAI embeddings (better but $$$) |
| **Vercel** | Zero-config Next.js deployment, edge network | AWS (complex), Railway (less edge) |
| **pgvector** | Vector search inside Postgres (no extra infra) | Pinecone (separate service, extra cost) |

---

*This is a living document. Updated as architecture evolves.*
*— CTO / Technical Co-Founder*

# PayWise AI — Development Progress

> Last updated: **4 March 2026**
> Status: **MVP Core + Savings Counter + PayWise AI Foundation (Phase 1) | Supabase Connected ✅**

---

## 🆕 PayWise AI — Phase 1 Foundation (March 4, 2026)

### What Was Built

#### AI Chat System ("Ask PayWise")
- [x] **Google Gemini 2.0 Flash integration** — `src/lib/ai/gemini.ts`
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
- [x] **7 new tables** in `supabase/migrations/003_paywise_ai.sql`:
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

### New Routes Added
| Route | Type | Description |
|-------|------|-------------|
| `/ask` | Dynamic | "Ask PayWise" AI chat interface (auth-gated) |
| `/dashboard` | Dynamic | Personal finance dashboard (auth-gated) |
| `/api/ai/chat` | POST | AI chat with Gemini, usage limits, conversation persistence |
| `/api/transactions` | GET/POST | Transaction CRUD with filters |
| `/api/profile` | GET/PATCH | User profile management |
| `/api/analytics/spending` | GET | Spending analytics engine |
| `/api/data/export` | GET | DPDP data export |
| `/api/data/delete` | DELETE | DPDP right to erasure |

### New Dependencies
- `@google/generative-ai` — Google Gemini 2.0 Flash SDK

### Setup Required
1. Run `npm install` to install new dependencies
2. Add `GOOGLE_AI_API_KEY=your-key-here` to `.env.local`
3. Run `supabase/migrations/003_paywise_ai.sql` in Supabase SQL Editor

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
├── .env.local                          # Supabase credentials ✅ CONFIGURED
├── next.config.ts                      # Next.js config (turbopack root set)
├── package.json                        # Dependencies
├── supabase/
│   ├── schema.sql                      # Complete DB schema + seed data ✅ RUN
│   └── migrations/
│       └── 002_user_savings.sql        # User savings tracking ✅ RUN
├── src/
│   ├── proxy.ts                        # Auth session refresh
│   ├── app/
│   │   ├── layout.tsx                  # Root layout (Navbar + Footer + Toaster)
│   │   ├── page.tsx                    # Homepage
│   │   ├── login/page.tsx              # Login page
│   │   ├── signup/page.tsx             # Signup page
│   │   ├── offers/page.tsx             # Offer dashboard
│   │   ├── recommend/page.tsx          # "Best Way to Pay"
│   │   ├── submit/page.tsx             # Submit an offer
│   │   ├── savings/page.tsx            # My Savings dashboard
│   │   ├── admin/page.tsx              # Admin panel
│   │   ├── extension/page.tsx          # Chrome Extension coming soon
│   │   ├── auth/callback/route.ts      # OAuth callback
│   │   └── api/
│   │       ├── offers/route.ts         # GET offers
│   │       ├── recommend/route.ts      # POST recommendations
│   │       ├── submit/route.ts         # POST offer submission
│   │       ├── waitlist/route.ts       # POST waitlist signup
│   │       ├── savings/
│   │       │   ├── track/route.ts      # POST log a saving event
│   │       │   └── stats/route.ts      # GET savings stats
│   │       └── admin/
│   │           ├── offers/route.ts     # Admin: create/manage offers
│   │           └── submissions/route.ts # Admin: review submissions
│   ├── components/
│   │   ├── auth/                       # Login + signup forms
│   │   ├── layout/                     # Navbar, footer, marquee
│   │   ├── offers/                     # Offer card + filters
│   │   ├── recommend/                  # Recommendation form
│   │   ├── submit/                     # Submit offer form
│   │   ├── savings/                    # Savings counter, tracker, history
│   │   ├── admin/                      # Admin dashboard, offer table, submissions
│   │   └── ui/                         # 14 shadcn/ui components
│   ├── lib/
│   │   ├── constants.ts                # App name, categories, payment apps, nav links
│   │   ├── env.ts                      # Typed env var helpers
│   │   ├── utils.ts                    # cn() utility
│   │   ├── validations.ts             # All Zod schemas
│   │   ├── rate-limit.ts              # In-memory rate limiter
│   │   ├── admin-auth.ts              # verifyAdmin() helper
│   │   └── supabase/                   # Browser, server, middleware, admin clients
│   ├── services/
│   │   ├── offers.ts                   # Offer CRUD services
│   │   └── lookups.ts                  # Categories, merchants, payment apps
│   └── types/
│       ├── database.ts                 # All DB types
│       └── api.ts                      # API response types
```

---

## 8. Build Status

```
✅ npm run build — PASSES (0 errors, 0 warnings)
✅ npm run dev   — All pages serve 200 OK
✅ TypeScript    — Strict mode, no errors
✅ Supabase      — Connected and operational
```

---

## 9. Remaining Work

### ✅ Completed - Supabase Setup (Feb 19, 2026)
- [x] Set real `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- [x] Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- [x] Run `supabase/schema.sql` in Supabase SQL Editor
- [x] Run `supabase/migrations/002_user_savings.sql` in Supabase SQL Editor
- [x] Enable Google OAuth provider in Supabase Auth settings

### ✅ Completed - Tier 1 Features (Feb 16, 2026)
- [x] **💰 Savings Counter System** (P0 - Critical for retention)
  - [x] Database schema with `user_savings` and `user_savings_stats` tables
  - [x] Auto-updating triggers for real-time stats
  - [x] API routes: `/api/savings/track` and `/api/savings/stats`
  - [x] UI components: SavingsCounter, TrackSavingButton, SavingsHistory
  - [x] Full savings dashboard page at `/savings`
  - [x] "I Used This" button integrated into offer cards
  - [x] Navigation menu updated with "My Savings" link

### ✅ Completed - Admin Panel (Feb 16, 2026)
- [x] Admin dashboard with tabs
- [x] Add offer form
- [x] Offer table management
- [x] Submission review system
- [x] Role-gated access (email whitelist)

### ✅ Completed - Security Hardening (Feb 16, 2026)
- [x] Rate limiting on all 6 API routes
- [x] Input validation (Zod + SQL CHECK constraints)
- [x] RLS enabled on all tables
- [x] IDOR protection
- [x] Admin RBAC

### 🔲 Testing (Now Unblocked)
- [ ] Test login/signup flow end-to-end
- [ ] Test offer submission → appears in dashboard flow
- [ ] Test savings tracking flow
- [ ] Test admin panel CRUD operations

### Tier 1 Features - In Progress (Weeks 2-3)
- [ ] **🔔 "Deal Dying" Push Alerts** (P0 - Creates daily habit)
  - [ ] Email notification system (Resend integration)
  - [ ] Push notification setup (Web Push API)
  - [ ] Cron job to check expiring offers
  - [ ] User notification preferences
  - [ ] Alert templates

- [ ] **🏷️ "Offer Stacking" Calculator** (P0 - Killer feature)
  - [ ] Stacking algorithm: combine UPI + bank + merchant offers
  - [ ] UI: Interactive stacking calculator
  - [ ] Show step-by-step breakdown
  - [ ] "Copy to clipboard" instructions

- [ ] **📊 Weekly Savings Report Email** (P1 - High engagement)
  - [ ] Email template (React Email)
  - [ ] Cron job (runs every Sunday 8 AM)
  - [ ] Personalized content: saved this week, missed deals, upcoming deals
  - [ ] Unsubscribe management

### Short Term (After Supabase Connected)
- [ ] Add more payment apps (Freecharge, Slice, Jupiter, Fi Money, Navi, JioFinancial)
- [ ] Set up `pg_cron` for hourly offer expiry
- [ ] **Set up cron for savings streak calculation** (NEW)
- [ ] Add Supabase Realtime subscription for live offer updates
- [ ] "Ending Soon" badges on offer cards
- [ ] User profile page (saved payment preferences)
- [ ] Admin panel enhancements (bulk upload, analytics)

### Medium Term (Week 2-4)
- [ ] Chrome Extension (see offers while browsing merchant sites)
- [ ] Email notifications (new deals for saved merchants)
- [ ] Offer scraping pipeline (auto-discover offers from bank/app websites)
- [ ] Analytics dashboard (Mixpanel integration)
- [ ] SEO optimization (dynamic OG images, sitemap)

### Tier 2 Features (Weeks 4-8)
- [ ] **🎮 Gamification: "Savings Streak"** - Daily streaks with multipliers and badges
- [ ] **🗳️ Community Trust System** - Upvote/downvote offers with verification
- [ ] **🤖 "Ask PayWise" Smart Assistant** - Natural language payment queries
- [ ] **📱 Payment App Wallet Balance Tracker** - Track and remind about wallet balances

### Tier 3 Features (Months 2-4)
- [ ] **🏢 "Smart Bill Pay"** - Recurring payment optimizer
- [ ] **🧾 Receipt Scanner** - OCR to analyze missed savings

---

*This file is the single source of truth for session continuity. Update it after each major milestone.*


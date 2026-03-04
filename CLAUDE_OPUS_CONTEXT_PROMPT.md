# PayWise — Claude Opus 4.6 Development Context Prompt

> **Purpose:** Paste this entire file at the start of a new conversation with Claude Opus 4.6 to instantly restore full project context, architecture understanding, and remaining work.
> **Generated:** 18 February 2026
> **Project Status:** MVP Core + Tier 1 Feature (Savings Counter) + Security Hardening — ALL COMPLETE

---

## 1. WHO YOU ARE — Role & Position

You are the **Lead AI Development Partner / Acting CTO** for **PayWise** — India's Payment Intelligence Platform.

- You are the **primary technical builder**. The founder (Bhanu Bisht, email: `yogendrabisht0617@gmail.com`) is a **business founder, not a developer**. You write ALL the code.
- You own the **entire full-stack architecture** — frontend, backend, database, API design, auth, infrastructure.
- You make technical decisions . ask "should I use X or Y?".
- You treat this as a **real production startup**, not a tutorial. Production-quality code, proper error handling, clean architecture.
- When given a feature request, implement it **end-to-end**: types → schema → service → API → UI → validation → error states.

---

## 2. WHAT WE'RE BUILDING — The Product

### One-Line
**PayWise** = "CardPointers for India's UPI ecosystem" — a web app + Chrome extension that tells users which payment app (PhonePe, GPay, Paytm, etc.) gives the best cashback for any transaction.

### The Problem
Indian consumers use 3-4 payment apps but have **zero visibility** into which app offers the best deal. 640M+ UPI transactions happen daily; users blindly pick their default app and miss ₹10-200 in cashback per transaction.

### The Solution
A recommendation engine + offer dashboard that:
1. **Aggregates** cashback/discount offers across all UPI apps, credit cards, and wallets
2. **Recommends** the best payment method for any merchant + amount combination
3. **Lets the community** submit, verify, and vote on offers
4. **Alerts users** when better deals appear (email, extension, notifications)
5. **Tracks savings** so users see their cumulative money saved

### Competitive Moat
PayWise is the **only neutral, cross-platform** recommendation engine. PhonePe will never tell users "use GPay for this transaction." That neutrality IS the moat.

---

## 3. TECH STACK (LOCKED IN — DO NOT CHANGE)

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript (strict mode) | 5.x |
| React | React | 19.2.3 |
| Styling | Tailwind CSS | v4 |
| Components | shadcn/ui | 13 components installed |
| Database | Supabase (PostgreSQL) | @supabase/ssr 0.8.0 |
| Validation | Zod | v4.3.6 |
| Forms | react-hook-form + @hookform/resolvers | 7.71.1 |
| Icons | Lucide React | 0.563.0 |
| Email | Resend | 6.9.2 (installed, not yet used) |
| Theming | next-themes | 0.4.6 |
| Toast | Sonner | 2.0.7 |
| Animation | Framer Motion | 12.34.0 |
| Date Utils | date-fns | 4.1.0 |

**Installed shadcn/ui components:** button, card, input, badge, separator, sheet, dialog, dropdown-menu, select, textarea, sonner, tabs, avatar, label

---

## 4. COMPLETE FILE STRUCTURE (Current State)

```
c:\Users\Bhanu Bisht\OneDrive\Desktop\upi\          ← Root workspace
├── .env.local                                        ← Supabase credentials (currently placeholders)
├── next.config.ts
├── package.json
├── tsconfig.json
├── PROGRESS.md                                       ← Session continuity doc (update after milestones)
├── IMPLEMENTATION_ROADMAP.md                         ← Detailed feature roadmap
├── FEATURE_SAVINGS_COUNTER.md                        ← Savings feature documentation
├── COPILOT_CONTEXT.md                                ← Older context doc (superseded by this file)
├── STRATEGIC_ANALYSIS.md                             ← Business strategy & retention features
├── STARTUP_PLAN.md                                   ← Full startup playbook (market, GTM, funding)
├── supabase/
│   ├── schema.sql                                    ← Complete DB schema + seed data (run first)
│   └── migrations/
│       └── 002_user_savings.sql                      ← User savings tracking migration (run second)
└── src/
    ├── proxy.ts                                      ← Auth session refresh middleware
    ├── app/
    │   ├── layout.tsx                                ← Root layout (Navbar + Footer + Toaster)
    │   ├── page.tsx                                  ← Homepage (hero, stats, features, categories, CTA)
    │   ├── globals.css                               ← Tailwind + custom styles
    │   ├── login/page.tsx                            ← Login (Google OAuth + Email Magic Link)
    │   ├── signup/page.tsx                           ← Signup (Google OAuth + Email Magic Link)
    │   ├── offers/page.tsx                           ← Offer dashboard with filters
    │   ├── recommend/page.tsx                        ← "Best Way to Pay" recommender
    │   ├── submit/page.tsx                           ← Community offer submission form
    │   ├── savings/page.tsx                          ← My Savings dashboard (auth-gated)
    │   ├── admin/page.tsx                            ← Admin panel (role-gated, email whitelist)
    │   ├── extension/page.tsx                        ← Chrome Extension coming soon page
    │   ├── auth/callback/route.ts                    ← OAuth callback handler
    │   └── api/
    │       ├── offers/route.ts                       ← GET offers (filtered, paginated, rate-limited)
    │       ├── recommend/route.ts                    ← POST recommendations (rate-limited)
    │       ├── submit/route.ts                       ← POST offer submission (auth + rate-limited)
    │       ├── waitlist/route.ts                     ← POST waitlist signup (rate-limited)
    │       ├── savings/
    │       │   ├── track/route.ts                    ← POST log a saving event (auth + rate-limited)
    │       │   └── stats/route.ts                    ← GET savings stats (auth + rate-limited)
    │       └── admin/
    │           ├── offers/route.ts                   ← Admin: create/manage offers
    │           └── submissions/route.ts              ← Admin: review community submissions
    ├── components/
    │   ├── auth/
    │   │   ├── login-form.tsx
    │   │   └── signup-form.tsx
    │   ├── layout/
    │   │   ├── navbar.tsx                            ← Floating pill navbar, auth-aware, dark mode
    │   │   ├── footer.tsx
    │   │   └── marquee.tsx                           ← Payment app logo marquee
    │   ├── offers/
    │   │   ├── offer-card.tsx                        ← Has "I Used This" TrackSavingButton integrated
    │   │   └── offer-filters.tsx
    │   ├── recommend/
    │   │   └── recommend-form.tsx
    │   ├── submit/
    │   │   └── submit-offer-form.tsx
    │   ├── savings/
    │   │   ├── savings-counter.tsx                   ← compact (navbar) + full (dashboard) variants
    │   │   ├── track-saving-button.tsx               ← "I Used This" dialog with amount input
    │   │   └── savings-history.tsx                   ← Tabbed: Recent / Categories / Trends
    │   ├── admin/
    │   │   ├── admin-dashboard.tsx                   ← Tabbed admin UI
    │   │   ├── add-offer-form.tsx                    ← Full offer creation form
    │   │   ├── offer-table.tsx                       ← Manage existing offers
    │   │   └── submission-review.tsx                 ← Review community submissions
    │   └── ui/                                       ← 14 shadcn/ui components
    ├── lib/
    │   ├── constants.ts                              ← APP_NAME, CATEGORIES, PAYMENT_APPS, NAV_LINKS, ADMIN_EMAILS
    │   ├── env.ts                                    ← Typed env var helpers
    │   ├── utils.ts                                  ← cn() utility
    │   ├── validations.ts                            ← All Zod schemas (recommend, submit, waitlist, offers, admin, savings)
    │   ├── rate-limit.ts                             ← In-memory rate limiter (4 presets)
    │   ├── admin-auth.ts                             ← verifyAdmin() helper for API routes
    │   └── supabase/
    │       ├── client.ts                             ← Browser client (with placeholder fallback)
    │       ├── server.ts                             ← Server client (with placeholder fallback)
    │       ├── middleware.ts                          ← Proxy helper (skips if not configured)
    │       └── admin.ts                              ← Service role client (bypasses RLS)
    ├── services/
    │   ├── offers.ts                                 ← getOffers, getOfferById, getTrendingOffers, getOffersByMerchantAndAmount
    │   └── lookups.ts                                ← getCategories, getMerchants, getPaymentApps
    └── types/
        ├── database.ts                               ← Offer, Merchant, PaymentApp, User, etc.
        └── api.ts                                    ← ApiResponse, PaymentRecommendation
```

---

## 5. WHAT'S BEEN BUILT (Fully Complete)

### ✅ MVP Core (Complete)
- **Homepage** — hero, stats, features, how-it-works, categories, CTA, payment app marquee
- **Offer Dashboard** (`/offers`) — filterable by category + payment app, paginated
- **"Best Way to Pay"** (`/recommend`) — merchant + amount → ranked recommendations
- **Submit Offer** (`/submit`) — community offer submission form
- **Login/Signup** — Google OAuth + Email Magic Link (Supabase Auth)
- **Auth Callback** — OAuth code → session exchange
- **All API routes** — offers, recommend, submit, waitlist

### ✅ Tier 1 Feature #1: Savings Counter (Complete — Feb 16, 2026)
- **Database:** `user_savings` + `user_savings_stats` tables with auto-updating triggers
- **API:** `POST /api/savings/track` + `GET /api/savings/stats`
- **UI:** SavingsCounter (compact + full), TrackSavingButton ("I Used This" dialog), SavingsHistory (tabbed)
- **Page:** `/savings` — full dashboard, auth-gated
- **Integration:** "I Used This" button on every offer card
- **Navigation:** "My Savings" link in navbar

### ✅ Admin Panel (Complete)
- **Page:** `/admin` — role-gated (email whitelist in `constants.ts`)
- **Components:** AdminDashboard (tabbed), AddOfferForm, OfferTable, SubmissionReview
- **API:** `/api/admin/offers` + `/api/admin/submissions`
- **Auth:** `verifyAdmin()` helper — checks session + email whitelist + returns admin Supabase client

### ✅ Security Hardening (Complete — Feb 16, 2026)
- **Rate limiting** on ALL 6 API routes (in-memory, 4 presets)
- **Input validation** — Zod at API level + SQL CHECK constraints at DB level (double layer)
- **RLS** enabled on all tables
- **IDOR protection** — user_id always from server session, never from request body
- **Admin RBAC** — email whitelist + service role client for admin operations

### ✅ Design System
- **Color palette:** Emerald green (`#059669`) as primary, zinc/neutral grays
- **Navbar:** Floating pill design, glassmorphism, auth-aware (shows user avatar + logout when logged in)
- **Dark mode:** Supported via next-themes
- **Typography:** System font stack, tight tracking
- **Build status:** ✅ 0 TypeScript errors, 0 build warnings

---

## 6. SUPABASE PLACEHOLDER WORKAROUND (CRITICAL — READ THIS)

The `.env.local` currently has **placeholder values** (not real Supabase credentials):
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Three files have a graceful fallback so the app runs without crashing:
- `src/lib/supabase/client.ts` — checks `isConfigured`, uses dummy URL if env vars missing
- `src/lib/supabase/server.ts` — same pattern
- `src/lib/supabase/middleware.ts` — skips session refresh if not configured

**The check:**
```ts
const isConfigured = SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 0;
```

**NEVER remove these `isConfigured` checks** until real credentials are set. Once Bhanu sets real credentials, zero code changes needed — it auto-connects.

### Environment Variables Needed
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   ← For admin operations (bypasses RLS)
RESEND_API_KEY=re_...              ← For email notifications (future)
```

---

## 7. DATABASE SCHEMA (Key Types)

```typescript
// From src/types/database.ts
OfferStatus   = "active" | "expired" | "pending" | "rejected"
OfferType     = "cashback" | "discount" | "reward_points" | "coupon" | "bogo"
PaymentMethodType = "upi" | "credit_card" | "debit_card" | "wallet" | "bnpl"
SubmissionStatus = "pending" | "approved" | "rejected"
```

### Key Tables (from supabase/schema.sql)
- `offers` — id, merchant_id, payment_app_id, type, title, description, cashback_amount, cashback_percent, max_cashback, min_transaction, valid_from, valid_to, terms, source_url, status, verified_count
- `merchants` — id, name, slug, category, logo_url, website_url
- `payment_apps` — id, name, slug, type, logo_url, color, supports_upi
- `categories` — id, name, slug, icon
- `users` — id, email, name, avatar, created_at
- `user_payment_methods` — id, user_id, payment_app_id, card_name, card_bank
- `offer_submissions` — id, user_id, offer_data, status
- `offer_verifications` — id, offer_id, user_id, is_valid, created_at

### New Tables (from supabase/migrations/002_user_savings.sql)
- `user_savings` — id, user_id, offer_id, amount_saved, transaction_amount, merchant_name, payment_app_name, category, notes, created_at
- `user_savings_stats` — user_id (PK), total_saved, total_transactions, saved_this_week, saved_this_month, saved_this_year, current_streak, longest_streak, last_activity_date, updated_at

### Seeded Data
- **10 categories** (Food Delivery, Groceries, Shopping, Bills & Recharges, Travel, Entertainment, Health & Pharmacy, Fuel, Education, Other)
- **9 payment apps** (PhonePe, Google Pay, Paytm, Amazon Pay, CRED, WhatsApp Pay, BHIM, Freecharge, Mobikwik)
- **15 merchants** (seeded in schema.sql)
- **6 sample offers** (demo data)

---

## 8. RATE LIMITING (All Routes Covered)

From `src/lib/rate-limit.ts`:

| Route | Limit | Key |
|-------|-------|-----|
| `POST /api/savings/track` | 20/min | User ID |
| `GET /api/savings/stats` | 30/min | User ID |
| `GET /api/offers` | 60/min | IP |
| `POST /api/recommend` | 60/min | IP |
| `POST /api/submit` | 20/min | User ID |
| `POST /api/waitlist` | 5/min | IP |

All return `429 Too Many Requests` with `Retry-After` header.

**Known limitation:** In-memory only — resets on deploy. Upgrade to Upstash Redis for production.

---

## 9. ADMIN ACCESS

- **Admin email whitelist:** `ADMIN_EMAILS` array in `src/lib/constants.ts`
- **Currently set to:** `["yogendrabisht0617@gmail.com"]`
- **Admin page:** `/admin` (server-side auth gate)
- **Admin API helper:** `verifyAdmin()` in `src/lib/admin-auth.ts` — use in all admin API routes
- **Admin Supabase client:** `getSupabaseAdminClient()` in `src/lib/supabase/admin.ts` — bypasses RLS

---

## 10. CODING RULES (MUST FOLLOW)

### Code Quality
1. **TypeScript strict mode** — no `any`, no `@ts-ignore`, no loosely typed code
2. **Zod validation** on every user input — forms, API params, query strings
3. **Server Components by default** — only add `"use client"` when truly needed (forms, interactivity)
4. **Error boundaries** — every page should handle error states gracefully
5. **Loading states** — skeleton UIs or spinners for async data
6. **Accessibility** — semantic HTML, ARIA labels, keyboard navigation
7. **Mobile-first** — Tailwind responsive classes

### Architecture
1. **App Router only** — no Pages Router, no `getServerSideProps`
2. **API routes for mutations** — use `route.ts` handlers, NOT server actions
3. **Services layer** — all DB queries go through `src/services/`, never directly in components
4. **Types in `src/types/`** — shared types, never inline `interface` in component files
5. **Constants in `src/lib/constants.ts`** — never hardcode values in components
6. **Validations in `src/lib/validations.ts`** — all Zod schemas centralized
7. **Components follow:** `src/components/{feature}/{component-name}.tsx`

### Supabase
1. **Browser client** (`createBrowserClient`) for client components only
2. **Server client** (`createServerClient` with cookies) for server components + API routes
3. **RLS enabled on all tables** — never bypass with service role key in client code
4. **Always filter `status = 'active'` and `valid_to >= now()`** for offers

### UI/Styling
1. **shadcn/ui first** — use existing components before building custom
2. **Tailwind CSS v4** — utility-first, no custom CSS unless absolutely needed
3. **`cn()` helper** for conditional classes (from `src/lib/utils.ts`)
4. **Lucide icons** — consistent icon set
5. **Sonner** for toast notifications
6. **Emerald green** as primary brand color (`text-emerald-600`, `bg-emerald-600`)
7. **Indian design sensibility** — ₹ symbol, Indian English, IST timezone

### Git & File Rules
1. **Update `PROGRESS.md`** after completing any major feature or milestone
2. **Never delete existing working code** without explicit instruction
3. **Preserve the placeholder workaround** — don't remove `isConfigured` checks

---

## 11. REMAINING WORK (Prioritized)

### 🔴 IMMEDIATE — Blocked on Supabase Credentials (Bhanu's Task)
These require Bhanu to set up Supabase — no code changes needed:
- [ ] Set real `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- [ ] Run `supabase/schema.sql` in Supabase SQL Editor
- [ ] Run `supabase/migrations/002_user_savings.sql` in Supabase SQL Editor
- [ ] Enable Google OAuth in Supabase Auth settings
- [ ] Test login → submit offer → see on dashboard flow
- [ ] Test savings tracking flow

### 🔴 TIER 1 — P0 Features (Weeks 2-3) — NOT STARTED

#### Feature 2: 🔔 "Deal Dying" Push Alerts
**Why P0:** Creates daily habit of checking PayWise. "⚡ Swiggy's ₹75 cashback expires in 2 hours" = FOMO.

**Files to Create:**
```
src/lib/notifications/email.ts          ← Resend email helper
src/lib/notifications/push.ts           ← Web Push API helper
src/app/api/notifications/subscribe/route.ts   ← POST: subscribe to push notifications
src/app/api/cron/expiring-offers/route.ts      ← GET: cron endpoint (check expiring offers → send alerts)
src/components/notifications/notification-preferences.tsx  ← UI for managing notification settings
src/app/settings/notifications/page.tsx        ← Notification settings page
```

**Implementation Notes:**
- Use **Resend** (already installed: `resend@6.9.2`) for email alerts
- Use **Web Push API** (no extra package needed) for browser push notifications
- Cron endpoint should be called by Vercel Cron or Supabase pg_cron
- Query: `SELECT * FROM offers WHERE valid_to BETWEEN NOW() AND NOW() + INTERVAL '24 hours' AND status = 'active'`
- Need a `user_notification_preferences` table (email_alerts, push_alerts, expiry_threshold_hours)
- Need a `push_subscriptions` table (user_id, endpoint, keys)

---

#### Feature 3: 🏷️ "Offer Stacking" Calculator
**Why P0:** Killer feature — no competitor in India does multi-layer deal stacking. "Use HDFC card on PhonePe at Amazon → ₹200 bank cashback + ₹75 PhonePe cashback + 5% Amazon Pay = ₹325 total savings"

**Files to Create:**
```
src/lib/stacking/calculator.ts          ← Stacking algorithm (combine UPI + bank + merchant offers)
src/components/stacking/stacking-calculator.tsx  ← Interactive UI
src/app/stack/page.tsx                  ← Stacking calculator page
src/app/api/stack/route.ts             ← POST: calculate stacked savings
```

**Implementation Notes:**
- Algorithm: Given merchant + amount + user's payment methods → find all combinable offers → calculate total savings
- Stacking layers: (1) UPI app cashback + (2) Bank/card cashback + (3) Merchant-specific offer
- UI: Step-by-step breakdown showing each layer of savings
- "Copy instructions" button: "1. Open PhonePe → 2. Use HDFC card → 3. Apply code SAVE50"
- Add to NAV_LINKS: `{ label: "Stack Offers", href: "/stack" }`

---

### 🟡 TIER 1 — P1 Features (Weeks 2-3) — NOT STARTED

#### Feature 4: 📊 Weekly Savings Report Email
**Why P1:** PhonePe's weekly statements have 42% open rates. Creates re-engagement.

**Files to Create:**
```
src/emails/weekly-report.tsx            ← React Email template
src/app/api/cron/weekly-report/route.ts ← GET: cron endpoint (runs Sunday 8 AM IST)
src/lib/email/templates.ts             ← Email template helpers
src/app/settings/notifications/page.tsx ← (shared with push alerts above)
```

**Implementation Notes:**
- Use **React Email** + **Resend** for beautiful HTML emails
- Content: Total saved this week, top 3 deals used, 3 upcoming deals, "what you missed" section
- Cron: Every Sunday 8 AM IST (`0 2 * * 0` in UTC)
- Unsubscribe: Token-based unsubscribe link (add `email_unsubscribe_token` to users table)
- Install: `npm install @react-email/components react-email`

---

### 🟡 SHORT TERM — After Supabase Connected

#### Technical Improvements
- [ ] **Upgrade rate limiter to Redis** — use Upstash Redis for production-grade rate limiting (install `@upstash/ratelimit` + `@upstash/redis`)
- [ ] **Set up pg_cron** — hourly `expire_old_offers()` + daily `reset_periodic_savings_stats()`
- [ ] **Supabase Realtime** — subscribe to offer changes for live updates
- [ ] **"Ending Soon" badges** — add to `offer-card.tsx` (< 24hrs = red "Ending Today!", < 3 days = orange "Ending Soon")
- [ ] **Open redirect fix** — validate `/login?redirect=` parameter (only allow internal paths)
- [ ] **Error boundaries** — add React Error Boundary component to all pages

#### UI/UX Improvements
- [ ] **Loading skeletons** — replace spinners with skeleton UIs
- [ ] **User profile page** — `/profile` with saved payment preferences
- [ ] **404 and error pages** — custom `not-found.tsx` and `error.tsx`
- [ ] **FAQ page** — `/faq`
- [ ] **Share offer button** — social sharing on offer cards
- [ ] **Dark mode toggle** — add to navbar

#### Data
- [ ] **Add more payment apps** — Slice, Jupiter, Fi Money, Navi, JioFinancial, Samsung Pay (add to `constants.ts` + DB)
- [ ] **Real offer data** — Bhanu needs to manually enter real offers via `/admin` panel

---

### 🟢 TIER 2 — Weeks 4-8 (NOT STARTED)

#### Feature 5: 🎮 Gamification: "Savings Streak"
- Daily streaks with multipliers (like Duolingo)
- Achievement badges: "Bill Buster (saved ₹500 on bills)", "Foodie Saver (saved ₹1000 on food delivery)"
- Streak calculation cron job (currently `current_streak` is always 0 in DB)
- **Files:** `src/lib/gamification/streaks.ts`, `src/components/gamification/streak-badge.tsx`, `src/app/api/cron/calculate-streaks/route.ts`

#### Feature 6: 🗳️ Community Trust System
- Upvote/downvote offers: "Did this cashback actually work?"
- Verification badges: "Verified by 127 users"
- Screenshot upload for proof
- **Files:** `src/app/api/offers/[id]/verify/route.ts`, `src/components/offers/verification-buttons.tsx`

#### Feature 7: 🤖 "Ask PayWise" Smart Assistant
- Natural language: "I'm paying ₹2,500 at Flipkart, what should I use?"
- Chat interface
- Integration with recommendation engine
- **Files:** `src/app/ask/page.tsx`, `src/app/api/ask/route.ts`, `src/components/ask/chat-interface.tsx`

#### Feature 8: 📱 Payment App Wallet Balance Tracker
- Manual balance entry
- "Use your wallet balance" suggestions
- **Files:** `src/app/wallets/page.tsx`, `src/app/api/wallets/route.ts`

---

### 🔵 TIER 3 — Months 2-4 (NOT STARTED)

- **Chrome Extension** (Manifest V3 + Plasmo framework) — detects checkout pages, shows popup
- **Android App** (React Native)
- **Offer Scraping Pipeline** — auto-discover offers from public pages
- **Receipt Scanner** — OCR to analyze missed savings
- **Smart Bill Pay** — recurring payment optimizer
- **B2B Data API** — sell structured offer feeds
- **Premium Subscription** — ₹99/mo tier

---

### 🔧 TECHNICAL DEBT (Ongoing)

- [ ] Add comprehensive logging (Sentry/LogRocket)
- [ ] Set up automated testing (Jest + Playwright)
- [ ] Performance optimization (React Query, caching)
- [ ] SEO improvements (dynamic OG images, sitemap.xml, structured data)
- [ ] PWA support for mobile
- [ ] Analytics integration (Mixpanel)
- [ ] Validate `/login?redirect=` for open redirect prevention

---

## 12. COMMANDS

```bash
npm run dev     # Start dev server (Turbopack) — http://localhost:3000
npm run build   # Production build
npm run start   # Serve production build
npm run lint    # ESLint check
```

**Working directory:** `c:\Users\Bhanu Bisht\OneDrive\Desktop\upi\`

---

## 13. KEY BUSINESS CONTEXT

### Revenue Streams (5)
1. **Affiliate commissions** — credit card referrals (₹200-2K/conversion) — launch Month 4
2. **Premium subscription** — ₹99/mo (alerts, stacking, tracker) — launch Month 10
3. **Sponsored placements** — payment apps pay for "Recommended" label — launch Month 7
4. **B2B Data API** — structured offer feed to fintech apps — launch Month 12
5. **Lead generation** — qualified leads to banks/payment apps — launch Month 6

### Target Users
- **Primary (60%):** "Savvy Optimizer" — age 22-35, Tier 1-2 cities, 3+ UPI apps
- **Secondary (25%):** "Credit Card Maximizer" — age 28-45, metros, 3+ credit cards
- **Tertiary (15%):** "Budget Family" — age 30-50, price-sensitive, bill payment focus

### Key Milestones
| Milestone | Target Date | Goal |
|-----------|------------|------|
| MVP Live (with Supabase) | Mar 2026 | 500 offers, basic auth working |
| Beta Launch | Apr 2026 | 5,000 users, Chrome extension live |
| PMF Validated | Sep 2026 | 75K users, D7 retention >30% |
| Pre-Seed Raise | Aug 2026 | ₹50L-1Cr at 25K-50K MAU |
| Series A | Aug 2027 | ₹15-25Cr at 500K-1M MAU |

---

## 14. HOW TO USE THIS FILE

1. **New conversation?** Paste this entire file as the first message, then state your request.
2. **After any major change:** Ask me to update `PROGRESS.md` with what was built.
3. **For Supabase setup:** Follow Section 6 and the steps in `PROGRESS.md` Section 3.
4. **For remaining features:** Reference Section 11 for prioritized work with file lists.

---

## 15. WHAT TO BUILD NEXT (RECOMMENDED ORDER)

Given the current state (Feb 18, 2026), here is the recommended next session plan:

### Option A — Connect Supabase (Highest Impact)
If Bhanu has Supabase credentials ready:
1. Update `.env.local` with real credentials
2. Run `supabase/schema.sql` in Supabase SQL Editor
3. Run `supabase/migrations/002_user_savings.sql`
4. Enable Google OAuth
5. Test end-to-end flows
6. Enter 50+ real offers via `/admin`

### Option B — Build "Deal Dying" Push Alerts (Next Feature)
If continuing code development:
1. Create `user_notification_preferences` table migration
2. Create `push_subscriptions` table migration
3. Build `src/lib/notifications/email.ts` (Resend integration)
4. Build `src/lib/notifications/push.ts` (Web Push API)
5. Build `POST /api/notifications/subscribe` route
6. Build `GET /api/cron/expiring-offers` route
7. Build notification preferences UI
8. Update `PROGRESS.md`

### Option C — Build "Offer Stacking" Calculator (Killer Feature)
1. Build `src/lib/stacking/calculator.ts` — the stacking algorithm
2. Build `POST /api/stack` route
3. Build `src/components/stacking/stacking-calculator.tsx`
4. Build `src/app/stack/page.tsx`
5. Add "Stack Offers" to NAV_LINKS
6. Update `PROGRESS.md`

---

*This is the single source of truth for session continuity. Generated by Antigravity on February 18, 2026.*
*Always update `PROGRESS.md` after completing any major milestone.*

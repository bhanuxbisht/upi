# PayWise — Development Progress

> Last updated: **11 February 2026**
> Status: **MVP Core Built — Awaiting Supabase Credentials**

---

## Table of Contents

1. [What's Been Built](#1-whats-been-built)
2. [Supabase Placeholder Workaround (What Changed & Why)](#2-supabase-placeholder-workaround)
3. [What You Need To Do Next (Supabase Setup)](#3-what-you-need-to-do-next)
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
| `/auth/callback` | Dynamic | Supabase OAuth callback handler (exchanges code for session) |

### API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/offers` | GET | Filtered + paginated offer listing with Zod validation |
| `/api/recommend` | POST | Recommendation engine — takes merchant + amount, returns ranked offers by savings |
| `/api/submit` | POST | Authenticated offer submission (requires login) |
| `/api/waitlist` | POST | Waitlist email signup |

### Infrastructure

- **Next.js 16.1.6** (App Router, Turbopack, TypeScript strict)
- **Tailwind CSS v4 + shadcn/ui** (13 components: button, card, input, badge, separator, sheet, dialog, dropdown-menu, select, textarea, sonner, tabs, avatar)
- **Supabase** (@supabase/supabase-js v2.95.3, @supabase/ssr v0.8.0)
- **Zod v4** for all input validation
- **react-hook-form** with @hookform/resolvers
- **Proxy (middleware)** — refreshes Supabase auth session on every request
- **Complete SQL schema** with 10 categories, 9 payment apps, 15 merchants, 6 sample offers

---

## 2. Supabase Placeholder Workaround

### The Problem

The `.env.local` file has **placeholder values** (not real Supabase credentials):

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The Supabase SDK (`@supabase/ssr`) **crashes** if you pass an invalid URL to `createBrowserClient()` or `createServerClient()`. It throws:

```
Error: Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.
```

This killed both `npm run build` and `npm run dev`.

### What I Changed (3 Files)

#### File 1: `src/lib/supabase/client.ts` (Browser Client)

**Before** — would crash immediately:
```ts
client = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

**After** — checks if credentials are real, falls back to a dummy URL that won't crash:
```ts
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const isConfigured = SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 0;

// If not configured, uses "https://placeholder.supabase.co" + "placeholder-key"
// The client initializes without crashing, but all queries will fail gracefully.
// A console.warn is logged: "[PayWise] Supabase is not configured..."
```

#### File 2: `src/lib/supabase/server.ts` (Server Client)

Same pattern — checks `isConfigured`, uses placeholder URL if not. Logs a warning.

#### File 3: `src/lib/supabase/middleware.ts` (Proxy/Middleware Helper)

Same pattern, but also **skips the entire session refresh** if not configured:
```ts
if (!isConfigured) return supabaseResponse; // Just pass through, don't call Supabase
```

### What This Means

- The app **runs and builds perfectly** without real Supabase credentials
- All pages render, all routes compile, dev server works
- Auth features (login/signup/Google OAuth) will show the UI but won't work until credentials are set
- API routes that query the database will return errors gracefully (not crash)
- **Once you provide real credentials, zero code changes needed** — the `isConfigured` check will pass and everything connects automatically

---

## 3. What You Need To Do Next

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → "New Project"
2. Pick a name (e.g. `paywise`), set a DB password, choose a region (Mumbai `ap-south-1` is ideal for Indian users)
3. Wait ~2 minutes for the project to spin up

### Step 2: Get Your Credentials

1. Go to **Settings → API** in your Supabase dashboard
2. Copy these two values:
   - **Project URL** → looks like `https://abcdefghij.supabase.co`
   - **anon / public key** → a long JWT string starting with `eyJ...`

### Step 3: Update `.env.local`

Open `paywise/.env.local` and replace the placeholders:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-service-key
```

### Step 4: Run the Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Paste the entire contents of `paywise/supabase/schema.sql`
3. Click **Run** — this creates all tables, indexes, RLS policies, and seeds initial data

### Step 5: Enable Google OAuth (Optional but Recommended)

1. Go to **Authentication → Providers → Google**
2. Enable it, paste your Google OAuth Client ID and Secret
3. Set the redirect URL to: `http://localhost:3000/auth/callback` (dev) or your production URL

### Step 6: Restart Dev Server

```bash
npm run dev
```

The `[PayWise] Supabase is not configured` warning will disappear, and everything will connect to your real database.

---

## 4. How To Restore Real Supabase Connection

**You don't need to change any code.** The placeholder workaround is designed to be transparent:

1. When `.env.local` has placeholder values → `isConfigured = false` → uses dummy URL, logs warning
2. When `.env.local` has real values → `isConfigured = true` → connects to your real Supabase instance

The check is simple:
```ts
const isConfigured = SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 0;
```

Since `"your-supabase-url"` doesn't start with `"http"`, it's treated as unconfigured. Once you set a real URL like `https://abc.supabase.co`, it auto-connects.

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

### For Real-Time App Discovery (Future)

When we scale, we'll build a scraper/admin panel to:
- Auto-detect new payment apps from NPCI's UPI ecosystem list
- Track app-specific offers via their developer APIs / partner feeds
- Let admins add apps from a dashboard without touching code

---

## 6. Offer Expiry & Auto-Rotation Strategy

### The Problem

Every cashback offer has an expiry date (`valid_to`). When an offer expires:
- It should stop showing in results immediately
- The next best active offer for the same merchant + payment app should take its place
- Users shouldn't see stale or expired deals

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

#### What Happens When An Offer Expires

1. **Offer Dashboard (`/offers`)** — The expired offer simply disappears from the list. The next offer in the sorted order (by `verified_count` then `created_at`) fills its place.

2. **Recommendation Engine (`/api/recommend`)** — When a user asks "best way to pay ₹500 at Swiggy":
   - The query filters `valid_to >= NOW()` — expired offers are skipped
   - Remaining active offers are ranked by estimated savings
   - The #1 recommendation is always the best *currently active* offer
   - If PhonePe's Swiggy offer expired but Google Pay's is still active, Google Pay moves to #1

3. **No Manual Intervention Needed** — The rotation is automatic because we always query active + non-expired.

### How To Make This Even Better (Planned Enhancements)

#### A. Supabase Cron for Auto-Expiry

Set up a Supabase pg_cron job to run `expire_old_offers()` every hour:

```sql
-- Run in Supabase SQL Editor after enabling pg_cron extension
SELECT cron.schedule(
  'expire-old-offers',
  '0 * * * *',  -- Every hour
  $$ SELECT expire_old_offers(); $$
);
```

This ensures offers are marked `expired` in the database even before a user queries them.

#### B. Real-Time Offer Refresh (Supabase Realtime)

Subscribe to offer changes on the client so the UI updates live:

```ts
// Future: src/hooks/use-realtime-offers.ts
const channel = supabase
  .channel("offers-changes")
  .on("postgres_changes", {
    event: "*",
    schema: "public",
    table: "offers",
  }, (payload) => {
    // Refresh the offers list when any offer is inserted/updated/deleted
    router.refresh();
  })
  .subscribe();
```

This means if an admin adds a new offer or one expires, all connected users see the update **instantly** without refreshing.

#### C. "Offer Ending Soon" Badges

Add visual urgency indicators:

- **< 24 hours left** → Red "Ending Today!" badge
- **< 3 days left** → Orange "Ending Soon" badge
- **< 7 days left** → Yellow "This Week" badge

Already have the data (`valid_to`) — just need to add the badge logic to `offer-card.tsx`.

#### D. Notification When Better Offer Appears

If a user saved a particular merchant (e.g. Swiggy), and a new higher-cashback offer appears:
- Send a push notification or email: "New deal! PhonePe now offers ₹100 cashback on Swiggy (was ₹50)"
- This uses Supabase Edge Functions + Resend email API

#### E. Offer Priority Queue

When multiple offers exist for the same merchant + payment app:
- Rank by: `verified_count` (community trust) → `cashback_amount` (highest first) → `valid_to` (furthest expiry first)
- This is already the default sort in `getOffers()` service

---

## 7. Full File Map

```
paywise/
├── .env.local                          # ← PUT YOUR SUPABASE CREDENTIALS HERE
├── next.config.ts                      # Next.js config (turbopack root set)
├── package.json                        # Dependencies
├── supabase/
│   └── schema.sql                      # Complete DB schema + seed data
├── src/
│   ├── proxy.ts                        # Auth session refresh (was middleware.ts)
│   ├── app/
│   │   ├── layout.tsx                  # Root layout (Navbar + Footer + Toaster)
│   │   ├── page.tsx                    # Homepage
│   │   ├── login/page.tsx              # Login page
│   │   ├── signup/page.tsx             # Signup page
│   │   ├── offers/page.tsx             # Offer dashboard
│   │   ├── recommend/page.tsx          # "Best Way to Pay"
│   │   ├── submit/page.tsx             # Submit an offer
│   │   ├── auth/callback/route.ts      # OAuth callback
│   │   └── api/
│   │       ├── offers/route.ts         # GET offers
│   │       ├── recommend/route.ts      # POST recommendations
│   │       ├── submit/route.ts         # POST offer submission
│   │       └── waitlist/route.ts       # POST waitlist signup
│   ├── components/
│   │   ├── auth/
│   │   │   ├── login-form.tsx          # Google + Magic Link login
│   │   │   ├── signup-form.tsx         # Google + Magic Link signup
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── navbar.tsx              # Responsive navbar
│   │   │   ├── footer.tsx              # Footer
│   │   │   └── index.ts
│   │   ├── offers/
│   │   │   ├── offer-card.tsx          # Individual offer card
│   │   │   └── offer-filters.tsx       # Search + filter sidebar
│   │   ├── recommend/
│   │   │   └── recommend-form.tsx      # Recommendation form + demo results
│   │   └── submit/
│   │       └── submit-offer-form.tsx   # Full offer submission form
│   ├── lib/
│   │   ├── constants.ts                # App name, categories, payment apps, nav links
│   │   ├── env.ts                      # Typed env var helpers
│   │   ├── validations.ts             # Zod schemas for all inputs
│   │   └── supabase/
│   │       ├── client.ts               # Browser client (with placeholder fallback)
│   │       ├── server.ts               # Server client (with placeholder fallback)
│   │       ├── middleware.ts            # Proxy helper (skips if not configured)
│   │       └── index.ts
│   ├── services/
│   │   ├── offers.ts                   # getOffers, getOfferById, getTrendingOffers, getOffersByMerchantAndAmount
│   │   ├── lookups.ts                  # getCategories, getMerchants, getPaymentApps
│   │   └── index.ts
│   └── types/
│       ├── database.ts                 # DB types (Offer, Merchant, PaymentApp, User, etc.)
│       ├── api.ts                      # API response types (ApiResponse, PaymentRecommendation)
│       └── index.ts
```

---

## 8. Build Status

```
✅ npm run build — PASSES (0 errors, 0 warnings)
✅ npm run dev   — All pages serve 200 OK
✅ TypeScript    — Strict mode, no errors
✅ 12 routes compiled successfully
```

### Route Summary

```
Route (app)
├ ● /                    (Static)
├ ● /_not-found          (Static)
├ ƒ /api/offers          (Dynamic)
├ ƒ /api/recommend       (Dynamic)
├ ƒ /api/submit          (Dynamic)
├ ƒ /api/waitlist        (Dynamic)
├ ƒ /auth/callback       (Dynamic)
├ ƒ /login               (Dynamic)
├ ● /offers              (Static)
├ ● /recommend           (Static)
├ ƒ /signup              (Dynamic)
└ ● /submit              (Static)
```

---

## 9. Remaining Work

### Immediate (Blocked on Supabase Credentials)
- [ ] Set real `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- [ ] Run `supabase/schema.sql` in Supabase SQL Editor
- [ ] Enable Google OAuth provider in Supabase Auth settings
- [ ] Test login/signup flow end-to-end
- [ ] Test offer submission → appears in dashboard flow

### Short Term (After Supabase Connected)
- [ ] Add more payment apps (Freecharge, Slice, Jupiter, Fi Money, Navi, JioFinancial)
- [ ] Set up `pg_cron` for hourly offer expiry
- [ ] Add Supabase Realtime subscription for live offer updates
- [ ] "Ending Soon" badges on offer cards
- [ ] User profile page (saved payment preferences)
- [ ] Admin panel for manual offer entry + approval

### Medium Term (Week 2-4)
- [ ] Chrome Extension (see offers while browsing merchant sites)
- [ ] Email notifications (new deals for saved merchants)
- [ ] Offer scraping pipeline (auto-discover offers from bank/app websites)
- [ ] Analytics dashboard (Mixpanel integration)
- [ ] SEO optimization (dynamic OG images, sitemap)

---

*This file is the single source of truth for session continuity. Update it after each major milestone.*

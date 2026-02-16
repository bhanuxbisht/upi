# PayWise Implementation Roadmap
## Based on Strategic Analysis - Feb 2026

> **Status:** Tier 1 Feature #1 Complete + Security Hardened
> **Last Updated:** February 16, 2026

---

## ✅ Completed (MVP Foundation)

### Core Infrastructure
- [x] Next.js app with TypeScript
- [x] Supabase authentication & database
- [x] Admin panel with role-based access
- [x] Offer management system (CRUD)
- [x] Community submission system
- [x] Basic recommendation engine
- [x] Responsive UI with Tailwind + shadcn/ui

### Pages & Routes
- [x] Homepage with hero & features
- [x] Offers dashboard with filters
- [x] "Best Way to Pay" recommender
- [x] Submit offer form
- [x] Login/Signup with Google OAuth
- [x] Admin panel (add/manage/review)

---

## ✅ Completed - Tier 1 Feature #1: Savings Counter (Feb 16, 2026)

### Database
- [x] `user_savings` table — tracks each individual saving event
- [x] `user_savings_stats` table — pre-computed stats (auto-updated via trigger)
- [x] `update_user_savings_stats()` trigger function
- [x] `reset_periodic_savings_stats()` helper for cron resets
- [x] RLS policies — users can only see own data
- [x] Helper views: `top_savers`, `recent_savings_activity`
- [x] CHECK constraints: `amount_saved > 0 AND <= 100000`, text length limits
- [x] Migration file: `supabase/migrations/002_user_savings.sql`

### API Routes
- [x] `POST /api/savings/track` — log a saving (with Zod validation + rate limiting)
- [x] `GET /api/savings/stats` — fetch stats, recent activity, categories, trends

### UI Components
- [x] `SavingsCounter` — compact (navbar) + full (dashboard with 4 stat cards)
- [x] `TrackSavingButton` — "I Used This" dialog with amount input
- [x] `SavingsHistory` — tabbed view (Recent / Categories / Trends)
- [x] `Label` component (shadcn/ui)

### Pages
- [x] `/savings` — full savings dashboard (auth-gated)
- [x] "My Savings" link in navbar

### Integration
- [x] "I Used This" button added to every offer card
- [x] Navigation updated

---

## ✅ Completed - Security Hardening (Feb 16, 2026)

### Rate Limiting — ALL API Routes
- [x] `src/lib/rate-limit.ts` — reusable rate limiter utility with 4 presets
- [x] `/api/savings/track` — **20 req/min** per user
- [x] `/api/savings/stats` — **30 req/min** per user
- [x] `/api/offers` — **60 req/min** per IP
- [x] `/api/recommend` — **60 req/min** per IP
- [x] `/api/submit` — **20 req/min** per user
- [x] `/api/waitlist` — **5 req/min** per IP (strictest — unauthenticated write)
- [x] Proper `429 Too Many Requests` responses with `Retry-After` header

### Input Validation Hardening
- [x] `amount_saved` max: ₹1,00,000
- [x] `transaction_amount` max: ₹1,00,00,000
- [x] `merchant_name` max: 200 chars
- [x] `payment_app_name` max: 200 chars
- [x] `category` max: 100 chars
- [x] `notes` max: 500 chars
- [x] Constraints enforced at BOTH Zod (API) and SQL (DB) levels

### Security Audit Passed
- [x] No SQL injection risks (Supabase client handles parameterization)
- [x] No XSS risks (React auto-escapes)
- [x] No IDOR risks (user_id always from server session)
- [x] RLS defense-in-depth (data isolation at DB level)
- [x] `.env*` in `.gitignore` (credentials safe)
- [x] TypeScript compilation: 0 errors

---

## 🚧 NOT YET DONE — Remaining Tier 1 Features (Weeks 2-3)

### 2. 🔔 "Deal Dying" Push Alerts
**Status:** Not Started
**Priority:** P0

**What to Build:**
- [ ] Email notification system (Resend integration)
- [ ] Push notification setup (Web Push API)
- [ ] Cron job to check expiring offers
- [ ] User notification preferences
- [ ] Alert templates

**Files to Create:**
- `src/lib/notifications/email.ts`
- `src/lib/notifications/push.ts`
- `src/app/api/notifications/subscribe/route.ts`
- `src/app/api/cron/expiring-offers/route.ts`
- `src/components/notifications/notification-preferences.tsx`

---

### 3. 🏷️ "Offer Stacking" Calculator
**Status:** Not Started
**Priority:** P0 — Killer feature, no competitor has this

**What to Build:**
- [ ] Stacking algorithm: combine UPI + bank + merchant offers
- [ ] UI: Interactive stacking calculator
- [ ] Show step-by-step breakdown
- [ ] "Copy to clipboard" instructions

**Files to Create:**
- `src/lib/stacking/calculator.ts`
- `src/components/stacking/stacking-calculator.tsx`
- `src/app/stack/page.tsx`
- `src/app/api/stack/route.ts`

---

### 4. 📊 Weekly Savings Report Email
**Status:** Not Started
**Priority:** P1

**What to Build:**
- [ ] Email template (React Email)
- [ ] Cron job (runs every Sunday 8 AM)
- [ ] Personalized content: saved this week, missed deals, upcoming deals
- [ ] Unsubscribe management

**Files to Create:**
- `src/emails/weekly-report.tsx`
- `src/app/api/cron/weekly-report/route.ts`
- `src/lib/email/templates.ts`
- `src/app/settings/notifications/page.tsx`

---

## 📋 Tier 2 Features (Weeks 4-8) — Not Started

### 5. 🎮 Gamification: "Savings Streak"
- [ ] Streak tracking system
- [ ] Achievement badges
- [ ] Leaderboard (optional)
- [ ] Daily challenge notifications

### 6. 🗳️ Community Trust System
- [ ] Upvote/downvote offers
- [ ] Verification badges
- [ ] User reputation system
- [ ] Screenshot upload for proof

### 7. 🤖 "Ask PayWise" Smart Assistant
- [ ] Natural language processing
- [ ] Quick answer engine
- [ ] Chat interface
- [ ] Integration with recommendation engine

### 8. 📱 Payment App Wallet Balance Tracker
- [ ] Manual balance entry
- [ ] Balance reminder system
- [ ] "Use your wallet balance" suggestions

---

## 🎯 Tier 3 Features (Months 2-4) — Not Started

### 9. 🏢 "Smart Bill Pay" - Recurring Payment Optimizer
- [ ] Recurring payment detection
- [ ] Auto-optimization suggestions
- [ ] Calendar integration

### 10. 🧾 Receipt Scanner → Savings Missed
- [ ] OCR integration
- [ ] Receipt analysis
- [ ] "What you could have saved" report

---

## 🔧 Remaining Technical Debt

- [ ] Add proper error boundaries (React Error Boundary component)
- [x] ~~Implement rate limiting on API routes~~ ✅ Done
- [ ] Add comprehensive logging (Sentry/LogRocket)
- [ ] Set up automated testing (Jest + Playwright)
- [ ] Performance optimization (React Query, caching)
- [ ] SEO improvements (metadata, sitemap)
- [ ] Set up `pg_cron` for `reset_periodic_savings_stats()` and `expire_old_offers()`
- [ ] Validate `/login?redirect=` for open redirect prevention

---

## 💡 Quick Wins (Can be done in parallel)

- [ ] Add "Share this offer" button (social sharing)
- [ ] Create embeddable widget for blogs
- [ ] Add dark mode toggle
- [ ] Improve mobile responsiveness
- [ ] Add loading skeletons
- [ ] Create 404 and error pages
- [ ] Add FAQ page

---

## 📊 Success Metrics (End of Week 3)

| Metric | Target |
|--------|--------|
| Users tracking savings | 60%+ of active users |
| Avg. savings tracked per user | ₹500+/week |
| Email open rate | >40% |
| Notification click-through | >25% |
| Stacking calculator usage | >30% of recommendations |

---

*This roadmap is a living document. Update after each sprint.*
*Last updated: February 16, 2026*

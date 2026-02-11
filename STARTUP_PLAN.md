# PayWise — Complete Startup Playbook
## India's Payment Intelligence Platform
### "Never overpay on a digital payment again"

> **Status:** Pre-MVP | **Start Date:** February 2026 | **Target:** Series A by Aug 2027
> **Founder Type:** Business Founder (needs CTO co-founder)
> **Budget:** ₹2L bootstrap | **Platform:** Web App + Chrome Extension

---

## Table of Contents

1. [Executive Summary & Market Analysis](#section-1-executive-summary--market-analysis)
2. [Product Strategy & Roadmap](#section-2-product-strategy--roadmap)
3. [Business Model & Monetization](#section-3-business-model--monetization)
4. [Go-To-Market Strategy](#section-4-go-to-market-strategy)
5. [Technical Architecture](#section-5-technical-architecture)
6. [Team & Operations](#section-6-team--operations)
7. [Legal, Compliance & Risk](#section-7-legal-compliance--risk)
8. [Funding Strategy](#section-8-funding-strategy)
9. [Key Metrics & KPIs](#section-9-key-metrics--kpis)
10. [90-Day Sprint Plan](#section-10-90-day-sprint-plan)
11. [Pitch Deck Outline](#section-11-pitch-deck-outline)
12. [Contingency Plans](#section-12-contingency-plans)
13. [Templates](#section-13-actionable-templates)

---

## Section 1: Executive Summary & Market Analysis

### 1.1 Problem Statement

Indian consumers use 3-4 payment apps on average (PhonePe, Google Pay, Paytm, Amazon Pay, CRED) but have **zero visibility** into which app offers the best deal for any given transaction. Every day, 640M+ UPI transactions happen, and users blindly pick their default app — missing ₹10-200 in cashback per transaction because offers are buried inside each app's interface, change daily, and differ by merchant, bank, card, and transaction amount.

**There is no unified layer that sits above all payment apps and tells you: "Pay with PhonePe here to save ₹50, but use Google Pay there to get 10% back."**

### 1.2 Solution Overview

**PayWise** is a web-based recommendation engine + browser extension that aggregates real-time cashback offers, discounts, and reward optimizations across all major UPI apps, credit/debit cards, and wallets in India. Before making any payment, users check PayWise (or get a browser popup) to see which payment method yields the maximum savings.

**Think "CardPointers for India's UPI ecosystem."**

- **Not a payment app** — we never process transactions
- **An intelligence layer** — we tell you WHERE to pay, then you open that app
- **Revenue from affiliates, premium subscriptions, and B2B data** — not transaction fees

### 1.3 Market Size

| Metric | Value | Calculation |
|--------|-------|-------------|
| **TAM** | ₹15,000 Cr/year ($1.8B) | 500M+ UPI users × ₹300/year avg. savings potential |
| **SAM** | ₹3,000 Cr/year ($360M) | ~100M savvy users (Tier 1-2, 22-45 age, multi-app) × ₹300/year |
| **SOM Year 1** | ₹3-5 Cr ($360K-600K) | 50K-100K active users × ₹50-60/year ARPU |
| **SOM Year 3** | ₹50-80 Cr ($6M-10M) | 1M-2M active users × ₹40-50 ARPU |
| **SOM Year 5** | ₹300-500 Cr ($36M-60M) | 5M-8M active users + B2B revenue |

### 1.4 Key Market Data (2025-2026)

| Stat | Value | Source |
|------|-------|--------|
| UPI Annual Transactions (2025) | 208.8 billion | NPCI |
| UPI Annual Value (2025) | ₹298.6 lakh crore (~$3.4T) | NPCI |
| Daily UPI Transactions | 640M+ | IMF (Jul 2025) |
| Active UPI Users | 500M+ | Industry |
| Banks on UPI | 691 | NPCI (Jan 2026) |
| UPI Share of Digital Payments | 84% | RBI (FY25) |
| YoY Volume Growth | ~49% | NPCI |
| PhonePe Market Share | ~48-49% | Industry |
| Google Pay Market Share | ~34-36% | Industry |
| Paytm Market Share | ~8-10% | Industry |

### 1.5 Competitive Landscape

**Direct Competitors: NONE (Whitespace)**

No platform in India aggregates real-time UPI cashback offers across all apps to recommend optimal payment methods.

| Indirect Competitor | What They Do | Why We're Different |
|---------------------|-------------|---------------------|
| **CashKaro** (20M+ users, ₹250Cr rev) | E-commerce affiliate cashback | Shopping cashback via affiliate links; we optimize **which payment app** |
| **GoPaisa** | E-commerce coupons/cashback | E-commerce only |
| **CRED** (20M+ users) | Credit card bill payment + rewards | Only credit card users; CRED-exclusive offers |
| **Magicpin** | Hyperlocal merchant deals | Location-based offline; no cross-platform comparison |
| **BankBazaar** | Financial product comparison | Compares cards/loans, not real-time offers |
| **CardPointers (US)** | Credit card optimizer | US-only, credit-card-only — our direct inspiration |

### 1.6 Why Now?

1. **UPI crossed 640M daily transactions (Jul 2025)** — surpassed Visa globally
2. **Credit Line on UPI launched (Aug 2024)** — new optimization layer
3. **RuPay Credit on UPI doubled in FY25** — multiple instruments per transaction
4. **NPCI 30% market cap rule** — more apps = more fragmented offers
5. **DPDP Act (2023)** — privacy-first platform is competitive advantage
6. **Payment app "offer wars"** — apps spending heavily on cashback

---

## Section 2: Product Strategy & Roadmap

### Phase 1: MVP (Months 0-3) — Feb to Apr 2026

#### Core Features (Prioritized)

| Priority | Feature | Description |
|----------|---------|-------------|
| **P0** | Offer Database Dashboard | Searchable listing of all current cashback offers across apps, filterable by merchant/category/payment method |
| **P0** | "Best Way to Pay" Recommender | User inputs merchant + amount → ranked list of payment options with savings |
| **P0** | Manual Offer Submission | Community-driven crowdsourced offer data |
| **P1** | Deal Alerts (Email) | Opt-in daily/weekly digest of top offers |
| **P1** | Chrome Browser Extension (v1) | Detects checkout pages → shows popup with best payment method |
| **P2** | User Accounts + Preferences | User selects which apps/cards they have → personalized results |

#### Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Frontend** | Next.js 14 (App Router) + TypeScript | SSR for SEO, React ecosystem |
| **UI** | Tailwind CSS + shadcn/ui | Rapid prototyping, responsive |
| **Extension** | Chrome Manifest V3 + React (Plasmo) | 70%+ Indian users on Chrome |
| **Backend** | Node.js 20 LTS + Express.js + TypeScript | Same language as frontend |
| **Database** | PostgreSQL 16 (Supabase) | Relational, full-text search, free tier |
| **Cache** | Redis (Upstash serverless) | Free tier: 10K commands/day |
| **Hosting** | Vercel (frontend) + Railway (backend) | Free/cheap tiers |
| **Auth** | Supabase Auth (Google OAuth + Email) | Free, built-in |
| **Analytics** | Mixpanel (free: 20M events/mo) | Event-based tracking |
| **Email** | Resend (free: 3K/mo) | Transactional + marketing |

**Total MVP cost: ₹0-2,000/month**

#### MVP Success Metrics (End of Month 3)

| Metric | Target |
|--------|--------|
| Registered Users | 5,000 |
| Weekly Active Users | 1,500 |
| Offers in Database | 500+ |
| Extension Installs | 1,000 |
| Community Submissions | 200+ |
| Avg. Session Duration | >2 minutes |
| NPS | >40 |

#### User Flow (MVP)

**Web Dashboard:**
1. User lands on paywise.in (via search "best UPI cashback offers today")
2. Sees top 20 offers, sortable by category
3. Clicks "Best Way to Pay" → enters "Swiggy, ₹500"
4. System shows ranked options: PhonePe (₹75 cashback) > GPay (₹25) > Paytm (none)
5. User taps "Open PhonePe" → deep link or instruction
6. After paying, marks "Used this offer" → community verification

**Browser Extension:**
1. User on swiggy.com at checkout
2. Extension detects checkout page
3. Popup: "Save ₹75! Pay with PhonePe. 2 more options →"
4. User clicks → sees full comparison → opens preferred app

#### Data Sources (Initial)

| Source | Method | Legal Status |
|--------|--------|-------------|
| Manual curation (2-3 interns) | Check each app daily, enter offers | ✅ 100% legal |
| Community crowdsourcing | Users submit offers via form | ✅ Legal |
| Public offer pages | Scrape phonepe.com/offers, bank pages | ✅ Legal (public, respect robots.txt) |
| Social media monitoring | Twitter, Reddit, Telegram deal groups | ✅ Legal (public data) |
| Bank websites | Credit/debit card offer pages | ✅ Legal (public) |

**Phase 1 data mix: 70% manual + 20% crowdsourced + 10% scraped**

### Phase 2: Product-Market Fit (Months 4-9)

| Feature | Month | Purpose |
|---------|-------|---------|
| Mobile-responsive PWA | M4 | 80%+ Indian traffic is mobile |
| Personalization Engine v1 | M5 | Filter by user's actual cards/apps |
| Automated Offer Scraping | M5-6 | Reduce manual work by 60% |
| Offer History | M6 | Predict future offers |
| Card Recommendation Engine | M7 | Affiliate revenue driver |
| WhatsApp Bot (v1) | M8 | 500M+ WhatsApp users in India |
| Push Notifications | M8 | Retention driver |
| Savings Tracker | M9 | Gamification + retention |

### Phase 3: Scale (Months 10-18)

| Area | Details | Month |
|------|---------|-------|
| Bill Payment Offers | Electricity, gas, broadband cashback comparison | M10 |
| Premium Tier Launch | ₹99/month subscription | M10 |
| Android App | React Native | M11 |
| EMI Comparison | BNPL + bank EMI options | M12 |
| B2B API (beta) | Sell offer data to fintech apps | M12 |
| Travel Booking Optimizer | IRCTC, MakeMyTrip cashback | M13 |
| AI Smart Alerts | Predictive offer notifications | M14-15 |
| Offline QR Optimization | Location-based merchant offers | M15 |
| Small Business Tools | Help shopkeepers pick best QR | M16 |

### Month-by-Month Roadmap

| Month | Release | Milestone |
|-------|---------|-----------|
| Feb 2026 (M1) | Landing page + waitlist | 1,000 waitlist emails |
| Mar 2026 (M2) | MVP web dashboard | 500 offers listed |
| Apr 2026 (M3) | Extension + "Best Way to Pay" | 5,000 users |
| May 2026 (M4) | PWA + user accounts | 10,000 users |
| Jun 2026 (M5) | Personalization + scrapers | 15,000 users |
| Jul 2026 (M6) | Offer history + verification | 25,000 users |
| Aug 2026 (M7) | Card recommendation engine | Affiliate revenue begins |
| Sep 2026 (M8) | WhatsApp bot + notifications | 50,000 users |
| Oct 2026 (M9) | Savings tracker + gamification | 75,000 users, PMF validated |
| Nov 2026 (M10) | Bill payments + Premium launch | ₹2-3L MRR |
| Dec 2026 (M11) | Android app | 150,000 users |
| Jan 2027 (M12) | EMI comparison + B2B API | ₹5-8L MRR |
| Feb 2027 (M13) | Travel optimizer | 250,000 users |
| Mar-Apr 2027 | AI alerts + offer stacking | 400,000 users |
| May-Jul 2027 | Offline + small biz tools | 750K-1M users, Series A ready |

---

## Section 3: Business Model & Monetization

### 3.1 Revenue Streams

| # | Stream | How | Launch | Yr1 | Yr2 | Yr3 | % Steady |
|---|--------|-----|--------|-----|-----|-----|----------|
| 1 | **Affiliate Commissions** | Credit card referrals (₹200-2K/conversion) | M4 | ₹15L | ₹1.2Cr | ₹5Cr | 30% |
| 2 | **Premium Subscription** | ₹99/mo or ₹799/yr — alerts, stacking, tracker | M10 | ₹5L | ₹60L | ₹3Cr | 25% |
| 3 | **Sponsored Placements** | Payment apps pay for "Recommended" label | M7 | ₹8L | ₹80L | ₹4Cr | 20% |
| 4 | **B2B Data API** | Structured offer feed to fintech apps | M12 | ₹2L | ₹40L | ₹3Cr | 15% |
| 5 | **Lead Generation** | Qualified leads to banks/payment apps | M6 | ₹5L | ₹50L | ₹2Cr | 10% |

**Totals: Year 1: ₹35L | Year 2: ₹3.5Cr | Year 3: ₹17Cr**

### 3.2 Pricing Tiers

**Free (80% of users):**
- Browse all offers
- 5 "Best Way to Pay" lookups/day
- Basic extension (top 1 recommendation)
- Weekly newsletter
- Community features

**Premium — "PayWise Pro" (₹99/mo or ₹799/yr):**
- Unlimited lookups
- Personalized recommendations
- Smart alerts (predictive)
- Offer stacking calculator
- Savings tracker + monthly report
- WhatsApp bot access
- Full extension (all options + auto promo codes)
- Ad-free

**B2B API:**
- Starter: ₹5K/mo (10K calls)
- Growth: ₹25K/mo (100K calls)
- Enterprise: Custom

### 3.3 Unit Economics

| Metric | Phase 1 | Phase 2 | Phase 3 |
|--------|---------|---------|---------|
| CAC | ₹15-25 | ₹30-50 | ₹50-80 |
| LTV (12mo) | ₹50 | ₹150 | ₹300 |
| LTV (24mo) | ₹80 | ₹280 | ₹550 |
| LTV:CAC | 2-3:1 | 3-5:1 | 5-7:1 |
| Payback Period | 4-6 mo | 2-3 mo | 1-2 mo |
| Monthly Churn | 15-20% | 8-12% | 5-8% |
| Premium Conversion | N/A | 3-5% | 5-8% |

### 3.4 Financial Projections

| Item | Year 1 | Year 2 | Year 3 |
|------|--------|--------|--------|
| Revenue | ₹35L | ₹3.5Cr | ₹17Cr |
| Team Cost | ₹40L | ₹2.5Cr | ₹8Cr |
| Infrastructure | ₹5L | ₹25L | ₹1Cr |
| Marketing | ₹15L | ₹1.5Cr | ₹4Cr |
| Other OpEx | ₹5L | ₹25L | ₹1Cr |
| **Total Burn** | **₹65L** | **₹4.75Cr** | **₹14Cr** |
| **Net** | **-₹30L** | **-₹1.25Cr** | **+₹3Cr** |

---

## Section 4: Go-To-Market Strategy

### 4.1 Channel Strategy

| Channel | % of Users | Monthly Cost | Tactics |
|---------|-----------|-------------|---------|
| **Organic/SEO** | 50% | ₹0 | 30+ SEO pages, daily-updated offer pages, long-tail keywords |
| **Community** | 30% | ₹0-5K | Telegram group, WhatsApp broadcasts, Reddit, deal communities |
| **Paid Ads** | 10% | ₹30K (from M3) | Instagram Reels + Google Search |
| **Influencers** | 5% | Rev-share | 10 micro-influencers (5K-50K followers) |
| **Referrals** | 5% | ₹0 | "Invite friend → both get Pro trial" |

### 4.2 Blog Topics (20 SEO Articles)

1. Best UPI Cashback Offers Today (Updated Daily) — February 2026
2. PhonePe vs Google Pay vs Paytm: Which Gives More Cashback in 2026?
3. Top 10 Credit Cards for UPI Payments
4. How to Get ₹500 Free Cashback Every Month Using Multiple UPI Apps
5. Complete Guide to Credit Line on UPI
6. Best Credit Card for Swiggy & Zomato (Up to 15% Back)
7. Amazon Pay Cashback Offers This Week — Hidden Deals
8. CRED Coins Value Calculator — Are They Worth It?
9. How to Stack UPI + Bank + Merchant Offers (Save 30%+)
10. Best UPI App for Bill Payments — Cashback Compared
11. RuPay Credit Card on UPI — Complete Guide
12. HDFC Credit Card UPI Offers 2026 — Every Deal Listed
13. SBI vs HDFC Credit Card — Which Saves More on UPI?
14. Best Payment Method for Flipkart Sale
15. Google Pay Scratch Card Tips
16. I Optimized Every Payment for 30 Days (Results)
17. WhatsApp Pay Cashback — Should You Switch?
18. How Millennials Save ₹10,000/Year Switching Payment Apps
19. Best UPI App for Mutual Fund SIP — Cashback Comparison
20. Monthly Report: Where Indians Waste Money Using Wrong Payment App

### 4.3 Social Media Calendar (Weekly)

| Day | Instagram | Twitter/X | LinkedIn |
|-----|-----------|-----------|----------|
| Mon | Carousel: Top 5 deals this week | Thread: Weekend spend recap | Industry insight article |
| Tue | Reel: 30s comparison video | Hot deal alert | — |
| Wed | Story poll: "Which app do you use?" | Meme about cashback FOMO | — |
| Thu | Carousel: Credit card of the week | Deal alert | Data-driven post |
| Fri | Reel: Weekend food delivery deals | Flash deal alert | — |
| Sat | Story: User testimonial | Weekend deal roundup | — |
| Sun | Carousel: Weekly savings report | Build-in-public update | — |

**Frequency:** Instagram 2x/day, Twitter 4-5x/day, LinkedIn 2x/week

### 4.4 Growth Hacks (10)

1. **"Payment Audit" Tool** — Free: enter monthly spend → see wasted savings (shareable)
2. **#PayWiseChallenge** — 7-day savings challenge on Instagram (UGC)
3. **Savings Leaderboard** — Public competitive board (FOMO)
4. **"Split the Bill" Finder** — Which friend should pay for max savings (social)
5. **Finance YouTuber audits** — "We audited [YouTuber]'s spending" content
6. **News-jacking** — Instant explainers on every RBI/UPI policy change
7. **Telegram Bot in deal groups** — Auto-respond to "best offer for X?" queries
8. **Extension savings counter** — Persistent "₹2.47Cr saved by users" badge
9. **"Employer Perk" pitch** — PayWise Pro as employee benefit (B2B2C)
10. **Wedding Season Campaigns** — "Save ₹50K+ on vendor payments" (Oct-Dec, Feb-Apr)

### 4.5 Target Segments

**Primary — "The Savvy Optimizer" (60%):**
- Age 22-35, Tier 1-2 cities, ₹4-15 LPA, 3+ UPI apps, 1-2 credit cards
- Found on: Instagram, Twitter fintech, Reddit, Telegram deal groups
- Message: "Stop leaving money on the table."

**Secondary — "The Credit Card Maximizer" (25%):**
- Age 28-45, metros, ₹10-30 LPA, 3+ credit cards
- Found on: CRED, CardExpert forums, LinkedIn
- Message: "You have ₹50,000 in unused rewards."

**Tertiary — "The Budget Family" (15%):**
- Age 30-50, Tier 1-3, price-sensitive, monthly bills focus
- Found on: WhatsApp, YouTube, local news apps
- Message: "Save ₹500-1,000 every month on bills."

---

## Section 5: Technical Architecture

### 5.1 System Design

```
[User Browser] → [Next.js Frontend on Vercel (SSR/CDN)]
                      ↓ (API calls)
              [Node.js/Express Backend on Railway]
                      ↓
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
[PostgreSQL DB]  [Redis Cache]  [Offer Scraper Service]
  (Supabase)     (Upstash)      (Puppeteer on Railway)
                                     ↓
                            [External Sources]

[Chrome Extension] → [Same Backend API]
[WhatsApp Bot]     → [Same Backend API]
```

### 5.2 Data Flow

1. **Ingestion:** Scrapers (6hr intervals) → fetch → normalize → validate → PostgreSQL
2. **Community:** User submits → pending queue → verify → live
3. **Serving:** Query → Redis cache check → PostgreSQL → rank by savings → filter by user methods → return top 5
4. **Extension:** Content script detects merchant → API call → recommendation → popup

### 5.3 Database Schema (Key Tables)

- `offers` — id, merchant_id, app_id, type, title, description, cashback_amount, cashback_percent, max_cashback, min_transaction, valid_from, valid_to, terms, source_url, status, verified_count
- `merchants` — id, name, slug, category, logo_url, website_url
- `payment_apps` — id, name, slug, type (upi/wallet/card), logo_url
- `categories` — id, name, slug, icon
- `users` — id, email, name, avatar, created_at
- `user_payment_methods` — id, user_id, payment_app_id, card_name, card_bank
- `offer_submissions` — id, user_id, offer_data, status (pending/approved/rejected)
- `offer_verifications` — id, offer_id, user_id, is_valid, created_at

### 5.4 Scalability

| Users | Architecture |
|-------|-------------|
| 0-10K | Supabase + Vercel + Railway (₹500-2K/mo) |
| 10K-100K | Supabase Pro + Upstash Pro + Vercel Pro (₹8-15K/mo) |
| 100K-1M | AWS (RDS + ElastiCache + ECS + CloudFront) (₹50K-1.5L/mo) |
| 1M+ | Kubernetes, microservices, DB sharding (₹3-5L/mo) |

---

## Section 6: Team & Operations

### 6.1 Founding Team

| Role | Skills | Equity (co-founder CTO) |
|------|--------|------------------------|
| CEO (You) | GTM, partnerships, fundraising, content | 50% |
| CTO | Full-stack, scraping, system design, extensions | 40% |
| ESOP Pool | — | 10% |

### 6.2 Hiring Roadmap

| Month | Hire | Type | Monthly Cost |
|-------|------|------|-------------|
| M1 | CTO co-founder | Equity, ₹0-15K stipend | ₹0-15K |
| M2 | 2x Data interns | Part-time | ₹5K each |
| M3 | Content writer | Freelancer | ₹10-15K |
| M5 | Junior full-stack dev | Full-time | ₹30-40K |
| M7 | Social media manager | Full-time/freelance | ₹20-25K |
| M9 | Backend developer | Full-time | ₹35-50K |
| M10 | Product designer | Freelance→FT | ₹30-40K |
| M12 | Data analyst | Full-time | ₹30-40K |

**Team Size:** M3=4, M6=6, M12=10, M18=15-18

### 6.3 Daily Offer Operations

1. 6 AM — Automated scrapers run
2. 8 AM — Intern reviews community queue
3. 9 AM — Manual check of top 10 apps
4. 10 AM — Daily newsletter auto-generated → sent 10:30 AM
5. 6 PM — Scrapers run again
6. 8 PM — Final manual check + mark expired
7. 11 PM — Automated expiry job

---

## Section 7: Legal, Compliance & Risk

### 7.1 Legal Structure

- **Entity:** Indian Private Limited Company (Companies Act 2013)
- **Registration:** MCA portal, cost ₹7-15K
- **Trademark:** File early, ₹4,500 via IP India

### 7.2 Compliance

| Area | Requirement |
|------|------------|
| DPDP Act 2023 | Consent popup, data deletion, privacy in English + Hindi |
| IT Act 2000 | SSL, secure auth, encrypted PII |
| Scraping | Public pages only, respect robots.txt |
| Affiliate Disclosure | ASCI: label all paid recommendations |
| GST | Register before ₹20L revenue |

### 7.3 Top Risks

| Risk | Mitigation |
|------|-----------|
| Apps block scraping | Diversify sources + seek API partnerships |
| Big player copies us | Cross-platform = conflict for single apps; B2B pivot |
| Data inaccuracy | Multi-source verification + community votes |
| CTO leaves | 4-year vesting, 1-year cliff, document everything |

---

## Section 8: Funding Strategy

### Bootstrap (M0-6): ₹2L personal

| Item | Cost |
|------|------|
| Company registration + trademark | ₹15K |
| Domain | ₹2K |
| Hosting (6 months) | ₹3K |
| Content writer (3 months) | ₹30K |
| Data interns (2×₹5K×4mo) | ₹40K |
| Paid ads (3mo×₹30K) | ₹90K |
| Legal | ₹10K |
| Misc | ₹10K |
| **Total** | **₹2,00,000** |

### Pre-Seed (M6-12): ₹50L-1Cr target

**Metrics needed:** 25K-50K MAU, 1K+ offers, ₹50K-1L MRR, D7 ret >30%

**Targets:** Titan Capital, Better Capital, 2am VC, Antler India, Y Combinator

### Series A (M18-24): ₹15-25Cr target

**Metrics needed:** 500K-1M MAU, ₹3-5Cr ARR, D30 ret >20%, LTV:CAC >5:1

**Targets:** Sequoia Surge, Accel India, Matrix Partners, Blume Ventures

### Cap Table Evolution

| Stage | Founders | ESOP | Angels | Seed | Series A |
|-------|----------|------|--------|------|----------|
| Start | 90% | 10% | — | — | — |
| Pre-Seed | 76.5% | 8.5% | 15% | — | — |
| Seed | 64% | 10% | 12.5% | 13.5% | — |
| Series A | 48% | 12% | 10% | 10% | 20% |

---

## Section 9: Key Metrics & KPIs

### Product Metrics

| Metric | Phase 1 | Phase 2 | Phase 3 |
|--------|---------|---------|---------|
| DAU | 500 | 5,000 | 50,000 |
| MAU | 5,000 | 50,000 | 500,000 |
| DAU/MAU | >15% | >20% | >25% |
| D1 Retention | >40% | >50% | >55% |
| D7 Retention | >20% | >30% | >35% |
| D30 Retention | >10% | >18% | >22% |
| Session Duration | >90s | >2min | >3min |

### Business Metrics

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| MRR (end) | ₹3L | ₹30L | ₹1.5Cr |
| ARR | ₹35L | ₹3.5Cr | ₹17Cr |
| CAC | ₹25 | ₹45 | ₹65 |
| LTV (12mo) | ₹75 | ₹200 | ₹350 |

### Operational SLAs

| Metric | Target |
|--------|--------|
| Offer freshness (<24hrs) | >90% |
| Data accuracy | >95% |
| API uptime | >99.5% |
| Support response | <24hrs → <4hrs |

---

## Section 10: 90-Day Sprint Plan

### Week 1 (Feb 11-17) — Foundation
- Register company name (MCA RUN form)
- Buy domain paywise.in
- Create brand assets (logo, colors, tagline)
- Set up GitHub repo
- Start CTO co-founder search (20 DMs/day)
- Join 10 Telegram deal groups

### Week 2 (Feb 18-24) — Research & Validate
- Survey 50 UPI users (Google Forms)
- Document offer pages for top 6 UPI apps
- Map all major bank offer pages
- Continue CTO outreach (30+ conversations)
- Create landing page wireframe

### Week 3 (Mar 1-7) — Landing + Waitlist
- Build landing page (Next.js on Vercel)
- Waitlist with email + "which apps" dropdown
- Start Telegram channel (5 deals/day manually)
- Create Instagram + Twitter accounts
- Write first 3 SEO blog posts
- Finalize CTO co-founder

### Week 4 (Mar 8-14) — MVP Build Starts
- Set up dev environment (GitHub, CI/CD, Supabase)
- Design + deploy DB schema
- Build admin panel for offer entry
- Start frontend: homepage + offer listing
- Enter 100 offers manually

### Week 5 (Mar 15-21) — Core Product
- Build offer dashboard (filterable, searchable)
- Build "Best Way to Pay" recommender
- Implement search (PostgreSQL full-text)
- Continue offer entry (target: 250)

### Week 6 (Mar 22-28) — Polish + Auth
- Implement auth (Supabase: Google + email)
- Add user preferences
- Mobile-responsive pass
- Community offer submission form
- Add Mixpanel analytics
- Hire 2 data interns

### Week 7 (Apr 1-7) — Beta Launch
- Final QA
- Deploy to production (paywise.in)
- Invite 200 beta users from waitlist
- Set up Sentry monitoring
- Create onboarding flow
- Launch announcement on all channels

### Week 8 (Apr 8-14) — Chrome Extension
- Build extension (Manifest V3 + Plasmo)
- Detect top 5 merchant checkout pages
- Publish to Chrome Web Store
- Collect beta feedback (survey + 10 interviews)

### Week 9 (Apr 15-21) — Iterate + Grow
- Fix top 10 bugs from feedback
- Launch daily deals newsletter
- Add offer verification (upvote/downvote)
- Optimize SEO (structured data, sitemap)
- Start first paid ad (₹10K Instagram)

### Week 10 (Apr 22-28) — Growth Push
- Launch referral program
- Reach out to 10 micro-influencers
- Write 3 more SEO articles (total: 10)
- Build automated scrapers for 5 public pages
- Add "Savings Calculator" tool
- Target: 400+ offers in DB

### Week 11 (May 1-7) — Retention Focus
- Analyze D7/D30 retention cohorts
- Implement PWA push notifications
- Add "Trending Offers" section
- Start WhatsApp broadcast group
- Launch #PayWiseChallenge on Instagram

### Week 12 (May 8-14) — Month 3 Milestone
- Compile 90-day metrics report
- Create investor one-pager
- Plan Phase 2 roadmap
- Write "3-month learnings" blog post
- Target: 5,000 users, 500+ offers, 1K extension installs

---

## Section 11: Pitch Deck (Slide-by-Slide)

| Slide | Title | Content |
|-------|-------|---------|
| 1 | Cover | Logo, tagline, founder names, raise amount |
| 2 | Problem | "640M+ daily UPI txns, users blindly pick default app." Screenshots of fragmented offers |
| 3 | Solution | "PayWise = financial GPS for every payment." 3-panel flow |
| 4 | Demo | Web dashboard + extension screenshots |
| 5 | Market | TAM/SAM/SOM circles, $3.4T UPI stat |
| 6 | Why Now | 4 icons: UPI > Visa, Credit Line launch, 30% cap rule, Offer wars |
| 7 | Traction | Growth curve, users, offers, engagement |
| 8 | Business Model | 5 streams pie chart, unit economics |
| 9 | Competition | 2×2 matrix (UPI coverage vs cross-platform) |
| 10 | GTM | Channel breakdown, growth loop diagram |
| 11 | Roadmap | 18-month timeline visual |
| 12 | Team | Bios, photos, relevant experience |
| 13 | The Ask | ₹50L, use of funds, milestones |
| 14 | Vision | "India's payment intelligence layer" |

---

## Section 12: Contingency Plans

### Pivot Scenarios

| Scenario | Pivot To |
|----------|---------|
| CAC too expensive | B2B-first (sell API to fintech apps) or WhatsApp-only bot |
| Scraping blocked | 100% community-driven + official API partnerships |
| Big player copies | Accelerate B2B, niche down, become acquisition target |

### Shutdown Criteria

**Pivot if (by Month 6):** <1K MAU, D7 ret <10%, zero revenue, no CTO found

**Shutdown if (by Month 12):** <5K MAU, rev <₹20K/mo, no funding, all data sources blocked

---

## Section 13: Actionable Templates

### Partnership Email Template
```
Subject: Driving High-Intent Users to [App] — Partnership

Hi [Name],

I'm [Your Name], founder of PayWise — helping 5,000+ users discover
best payment offers across UPI apps.

When users search "best way to pay at Swiggy," we recommend [App]
when your offers win. We're driving X clicks/month to your offers.

Proposal:
1. Access to real-time offer API/feed
2. Affiliate commission on new user activations

Win-win: you get high-intent users, our users get verified offers.

15-minute call this week?

Best, [Your Name]
```

### Influencer DM Template
```
Hey [Name]! Love your content on [topic]. I'm building PayWise — a
free tool that tells you which UPI app to use for max cashback.

Would you try it? I can set up an affiliate link — you earn per
sign-up, no cost or commitment.

DM me if interested! 🙌
```

### Telegram Deal Post Format
```
🔥 TOP 5 DEALS — [Date] 🔥

1. 🍕 Swiggy: ₹75 cashback via PhonePe (min ₹199)
2. 🛒 BigBasket: 10% back HDFC on GPay (max ₹200)
3. ⚡ Electricity: ₹50 cashback Paytm (bills >₹500)
4. 📱 Jio Recharge: 5% back Amazon Pay (>₹399)
5. ☕ Starbucks: B1G1 via CRED Pay

💡 Stack PhonePe cashback + Swiggy "SUPER50" = save ₹125!

🔗 All 800+ offers: paywise.in
```

---

## Verification Milestones

| Checkpoint | Date | Go/No-Go |
|-----------|------|----------|
| Week 4 | Mar 14, 2026 | Company registered, domain live, CTO identified, 100 offers in DB |
| Week 7 | Apr 7, 2026 | MVP live, 200 beta users, <5 critical bugs |
| Week 12 | May 14, 2026 | 5K users, 500+ offers, extension live, first affiliate rev |
| Month 6 | Aug 2026 | 25K users, ₹50K MRR, D7 ret >25%, pre-seed raised |
| Month 12 | Feb 2027 | 100K users, ₹3L MRR, Android live, seed closed |
| Month 18 | Aug 2027 | 500K-1M users, ₹15L MRR, B2B revenue, Series A ready |

---

*Last updated: February 11, 2026*
*Document version: 1.0*

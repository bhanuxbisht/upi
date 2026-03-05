# PayWise AI Implementation Roadmap
## Revised After Architecture Audit — March 2026

> **Status:** Phase 1 Complete, Phase 2 PIVOTED to RAG Architecture
> **Last Updated:** 5 March 2026
> **Key Decision:** Pivot from prompt-engineering to RAG (Retrieval-Augmented Generation)

---

## PHASE 1: COMPLETED (MVP + AI Foundation + Knowledge Engine)

### Core Infrastructure & Database
- [x] Next.js 16.1.6 app with TypeScript & Tailwind v4
- [x] Supabase authentication (Email/Google OAuth) & database schema (15+ tables)
- [x] Rate Limiting — all API routes protected (20-60 req/min)
- [x] Input Validation (Zod v4) + SQL CHECK constraints
- [x] All user/AI/savings tables with RLS
- [x] Automated Audit Logging for DPDP compliance

### AI System (Current — Prompt Engineering)
- [x] Groq API integration (Llama 3.3 70B Versatile) — Free tier
- [x] Knowledge engine: 14 credit cards, 6 UPI apps, 7 stacking strategies (hardcoded TypeScript)
- [x] Query analyzer: 15 intent types, 35+ merchant patterns, entity extraction
- [x] Domain-expert system prompt with `[VERIFIED DATA]` blocks
- [x] Context builder with knowledge injection (`userQuery` -> `analyzeQuery()` -> `buildKnowledgeContext()`)
- [x] AI Chat API with usage limits (Free: 3/day, Pro: unlimited)
- [x] Proactive insights API (5 types, urgency-sorted)
- [x] Transaction import API (parses bank SMS/statements, 80+ merchant patterns)

### Pages & Features
- [x] Homepage, Offers, Recommend, Submit, Savings, Dashboard, Ask AI, Admin — all working
- [x] 33 routes total, 0 build errors
- [x] Mobile responsive, dark mode supported

### What's Wrong (Honest Assessment)
- Knowledge is static TypeScript — goes stale the moment it's written
- Query analyzer uses `q.includes("swiggy")` — breaks on typos, indirect references
- Proactive insights are hardcoded if/else rules, not data-driven
- No onboarding — every user gets the same generic answer
- LLM does zero reasoning — just reformats data we already computed

---

## PHASE 2: REAL INTELLIGENCE (Weeks 1-4) — THE PIVOT

### 1. Admin Panel for Knowledge Management (P0 — This Session)
- [ ] Web UI at `/admin/knowledge` for CRUD on all knowledge data
- [ ] `knowledge_credit_cards` table (replaces `credit-cards.ts`)
- [ ] `knowledge_upi_apps` table (replaces `upi-apps.ts`)
- [ ] `knowledge_offers` table (replaces stale seed offers)
- [ ] `knowledge_strategies` table (replaces `payment-strategies.ts`)
- [ ] Every entry: `last_verified_date`, `verified_by`, `confidence_level`, `source_url`
- [ ] Search, filter, "Mark as expired" functionality

### 2. Database Migration — Code to Supabase (P0 — This Session)
- [ ] Migrate 14 credit cards from TypeScript to `knowledge_credit_cards`
- [ ] Migrate 6 UPI apps to `knowledge_upi_apps`
- [ ] Migrate strategies to `knowledge_strategies`
- [ ] Update context builder to read from Supabase (keep TypeScript as fallback)

### 3. Vector Search / RAG Pipeline (P0 — Next Session)
- [ ] Enable pgvector extension in Supabase
- [ ] Generate embeddings for all knowledge entries (OpenAI `text-embedding-3-small` or free alternative)
- [ ] `embedding` column on all knowledge tables
- [ ] Semantic search function: query -> embed -> cosine similarity -> top N results
- [ ] Replace keyword-matching in query analyzer with semantic retrieval
- [ ] Send focused context (5-10 relevant facts) to LLM instead of everything

### 4. Smart Onboarding (P1 — After RAG)
- [ ] First-visit flow: "What cards do you have?" + "Which apps do you use?" + "Monthly budget?"
- [ ] Store in `user_profiles` (fields already exist)
- [ ] All AI answers personalized to user's actual toolkit
- [ ] "Setup score" indicator — encourage completing profile

---

## PHASE 3: REVENUE ACTIVATION (Weeks 5-8)

### 5. Razorpay Pro Subscription (P0)
- [ ] Razorpay integration for PayWise Pro (Rs.99/mo, Rs.999/yr)
- [ ] `/pricing` page with plan comparison
- [ ] Webhook handling: payment success -> `pro_user: true`
- [ ] Pro unlocks: unlimited AI, priority insights, export reports

### 6. Affiliate Link Tracking (P0)
- [ ] "Apply via PayWise" links on card recommendations
- [ ] Click tracking: `/go/{card-slug}?ref={source}`
- [ ] Revenue logging per click/conversion
- [ ] AI naturally recommends best card — affiliate revenue is aligned with user value

### 7. User Engagement & Alerts (P1)
- [ ] Email notifications (Resend — already installed)
- [ ] "Deal Dying" Push Alerts (Web Push API)
- [ ] Weekly "PayWise Insider" newsletter
- [ ] User notification preferences UI

### 8. SEO & Growth (P1)
- [ ] Programmatic SEO pages: "Best way to pay at [Merchant]"
- [ ] Mixpanel analytics integration
- [ ] PWA manifest + service worker
- [ ] Dynamic OG images, sitemap.xml

---

## PHASE 4: SCALE & MOAT (Weeks 9-16)

### 9. Chrome Extension (P2)
- [ ] Auto-detect payment pages (Amazon, Flipkart, Swiggy)
- [ ] Popup: "Use [card] on [app] -> save Rs.[X]"
- [ ] Auto-apply promo codes

### 10. Real Proactive Intelligence (P2)
- [ ] Analyze user's actual transactions: "You paid Swiggy 6 times via GPay this month"
- [ ] Compare against optimal: "HDFC Millennia would save you Rs.120/month"
- [ ] Dashboard insights driven by real spending patterns, not rules

### 11. Community Trust System (P2)
- [ ] Upvote/downvote offers ("Did this cashback work?")
- [ ] Verification badges: "Verified by 127 users"
- [ ] Screenshot proof uploads

### 12. B2B & Enterprise (P3)
- [ ] Account Aggregator integration (auto-fetch transactions)
- [ ] B2B Data Insights API (anonymized spending trends)
- [ ] Merchant self-serve dashboard for sponsored offers

---

## TECHNICAL DEBT (Ongoing)
- [ ] Upgrade rate limiter: in-memory to Upstash Redis
- [ ] Add Sentry/LogRocket for error monitoring
- [ ] Automated testing (Jest + Playwright)
- [ ] React Query caching layer
- [ ] `pg_cron` for offer expiry + streak calculation

---

## CEO vs CTO Task Split

| What | Who Does It | Reference |
|------|------------|-----------|
| Verify credit card data from bank websites | **Bhanu (CEO)** | `CEO_TASKS.md` Task 1 |
| Collect live offers from apps | **Bhanu (CEO)** | `CEO_TASKS.md` Task 2 |
| Test AI + document failures | **Bhanu (CEO)** | `CEO_TASKS.md` Task 3 |
| Set up Razorpay + affiliate accounts | **Bhanu (CEO)** | `CEO_TASKS.md` Task 6 |
| Recruit 50 beta users | **Bhanu (CEO)** | `CEO_TASKS.md` Task 7 |
| Build admin panel + DB migration | **AI CTO** | `CTO_PLAN.md` Build 1-2 |
| Implement vector search (RAG) | **AI CTO** | `CTO_PLAN.md` Build 3 |
| Build onboarding flow | **AI CTO** | `CTO_PLAN.md` Build 4 |
| Integrate Razorpay + affiliates | **AI CTO** | `CTO_PLAN.md` Build 6-7 |

---

*This roadmap is a living document. Updated after the March 5, 2026 architecture audit that revealed the prompt-engineering to RAG pivot requirement. See CTO_PLAN.md for detailed technical explanations of each build.*

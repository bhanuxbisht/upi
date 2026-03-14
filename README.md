# PayWise — India's Payment Intelligence Platform

> **Which payment app + credit card combo gives you the best cashback?**
> PayWise tells you instantly — for any merchant, any amount, every time.

---

## The Problem

640M+ UPI transactions happen daily in India. Consumers use 3-4 payment apps but have **zero visibility** into which one gives the best deal for their specific transaction. They blindly pick their default app and miss Rs.10-200 in cashback every time.

## The Solution

PayWise is the **only neutral, cross-platform** payment recommendation engine in India. PhonePe will never tell you "use GPay for this." We will.

- **AI Assistant** — Ask "Best way to pay Rs.500 at Swiggy?" and get a specific, verified answer
- **Offer Dashboard** — All cashback/discount offers across 9+ payment apps in one place
- **Smart Recommendations** — Enter merchant + amount, get ranked payment methods by savings
- **Savings Tracker** — See how much you've saved using PayWise recommendations
- **Personal Dashboard** — Spending analytics, category breakdown, missed savings alerts

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase (PostgreSQL with RLS) |
| AI | Groq API (Llama 3.3 70B Versatile) |
| Auth | Supabase Auth (Google OAuth + Email Magic Links) |
| Validation | Zod v4 |
| Deployment | Vercel (planned) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase project
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Setup

```bash
# Clone and install
git clone <repo-url>
cd upi
npm install

# Configure environment
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#          SUPABASE_SERVICE_ROLE_KEY, GROQ_API_KEY

# Set up database
# Run supabase/schema.sql in Supabase SQL Editor
# Run supabase/migrations/002_user_savings.sql
# Run supabase/migrations/RUN_THIS_NEXT.sql
# Run supabase/migrations/004_knowledge_tables.sql
# Run supabase/migrations/005_smart_retrieval.sql

# If your project already has older AI tables, also run:
# supabase/migrations/006_user_transactions_import_alignment.sql
# supabase/migrations/007_event_outbox.sql

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Commands

```bash
npm run dev     # Development server (Turbopack)
npm run build   # Production build (33 routes, 0 errors)
npm run start   # Serve production build
npm run lint    # ESLint check
```

---

## Architecture

```
User Question -> Query Analyzer (15 intents, entity extraction)
    -> Knowledge Engine (14 credit cards, 6 UPI apps, 7 strategies)
    -> Context Builder (user profile + spending + domain knowledge)
    -> Groq LLM (Llama 3.3 70B) -> Personalized answer
```

**Current state:** Prompt-engineering with hardcoded knowledge.
**Next milestone:** RAG architecture with Supabase pgvector for semantic retrieval.

See [CTO_PLAN.md](CTO_PLAN.md) for the technical roadmap.

---

## Key Pages

| Route | Description |
|-------|------------|
| `/` | Homepage |
| `/offers` | Offer dashboard with filters |
| `/recommend` | "Best Way to Pay" recommender |
| `/ask` | AI chat assistant (auth required) |
| `/dashboard` | Spending analytics (auth required) |
| `/savings` | Savings tracker (auth required) |
| `/admin` | Admin panel (role-gated) |

---

## Project Documentation

| Document | Purpose |
|----------|---------|
| [PROGRESS.md](PROGRESS.md) | Development log — source of truth |
| [CEO_TASKS.md](CEO_TASKS.md) | Founder's action items |
| [CTO_PLAN.md](CTO_PLAN.md) | Technical build plan |
| [VISION.md](VISION.md) | Company vision & roadmap |
| [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) | Technical phases |
| [STRATEGIC_ANALYSIS.md](STRATEGIC_ANALYSIS.md) | Competitor analysis |

---

## Revenue Model

1. **Affiliate commissions** — Credit card referrals (Rs.200-2K/conversion)
2. **Pro subscription** — Rs.99/mo for unlimited AI, smart alerts
3. **Sponsored placements** — Payment apps pay for "Recommended" label
4. **B2B Data API** — Structured offer feeds to fintech apps
5. **Lead generation** — Qualified leads to banks

---

## Status

- **Build:** 33 routes, 0 errors, TypeScript strict
- **Database:** 15+ tables, RLS enabled, Supabase connected
- **AI:** Groq API active, knowledge engine with 14 cards/6 apps/7 strategies
- **Revenue:** Rs.0 (pre-revenue, Razorpay integration pending)
- **Users:** Pre-launch

---

*Built by Bhanu Bisht. Powered by AI.*

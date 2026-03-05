# PayWise — AI Context (Redirect)

> **This file is SUPERSEDED.** Use `CLAUDE_OPUS_CONTEXT_PROMPT.md` for full project context.

---

## Quick Reference (March 5, 2026)

**Product:** PayWise — India's neutral payment intelligence platform
**Founder:** Bhanu Bisht (`yogendrabisht0617@gmail.com`)
**Stack:** Next.js 16.1.6 | TypeScript strict | Tailwind v4 | Supabase | Groq (Llama 3.3 70B)
**Status:** 33 routes, 0 errors, Supabase connected, Groq API active

### Current Architecture Problem
AI is a prompt-engineering system (regex matching + hardcoded TypeScript data + LLM reformatting). Needs RAG pivot (verified DB data + vector search + focused LLM reasoning).

### What Exists
- Knowledge engine: 14 credit cards, 6 UPI apps, 7 stacking strategies
- Query analyzer: 15 intent types, 35+ merchant patterns
- Chat API, insights API, transaction import API, dashboard, savings tracker
- Full auth (Google OAuth + magic links), admin panel, DPDP compliance

### What's Next (Priority)
1. Admin panel for knowledge management (no-code data updates)
2. DB migration (TypeScript files -> Supabase tables)
3. Vector search (pgvector RAG)
4. Smart onboarding (personalized AI answers)
5. Razorpay + affiliate link revenue

### Key Files
- `CLAUDE_OPUS_CONTEXT_PROMPT.md` — Full context for new sessions
- `CEO_TASKS.md` — Bhanu's 7 action items
- `CTO_PLAN.md` — 7 technical builds (RAG architecture plan)
- `PROGRESS.md` — Development log (source of truth)
- `IMPLEMENTATION_ROADMAP.md` — Phase 1-4 roadmap
- `VISION.md` — Company vision document

---

*For complete context, use `CLAUDE_OPUS_CONTEXT_PROMPT.md`.*

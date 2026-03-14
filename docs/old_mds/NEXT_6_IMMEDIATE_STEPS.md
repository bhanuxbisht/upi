# PayWise — Immediate 6-Step Execution Plan

Last updated: 14 March 2026
Owner: Founder + AI CTO
Goal: Move from strong MVP to real-time, production-grade financial assistant.

## Why This File
This is the exact execution version of the 6 immediate next steps identified in the audit, converted into actionable work with completion criteria.

## Step 1: Fix Data Correctness First (P0)
Status: In progress (schema/write-path alignment completed; rollout migration execution pending)

What to do:
1. Align `user_transactions` schema and write paths.
2. Fix transaction import fields mismatch (`description`, `source`) against actual DB schema.
3. Create one migration source of truth and remove schema drift between docs and SQL files.

Definition of done:
1. Transaction import writes succeed for all valid inputs.
2. No runtime insert errors from `/api/transactions/import`.
3. DB schema doc and migration files match exactly.

Primary files:
1. `src/app/api/transactions/import/route.ts`
2. `supabase/migrations/RUN_THIS_NEXT.sql`
3. `supabase/schema.sql`

---

## Step 2: Enforce DB-First Intelligence (P0)
Status: In progress (DB-first + response freshness metadata added)

What to do:
1. Make core recommendation math consume database knowledge by default.
2. Keep TypeScript hardcoded knowledge only as emergency fallback.
3. Remove stale hardcoded dependency from critical decision paths.

Definition of done:
1. Top recommendation paths are DB-driven.
2. Hardcoded fallback is only used when DB/service unavailable.
3. Every AI response includes freshness metadata from DB records.

Primary files:
1. `src/lib/ai/context-builder.ts`
2. `src/lib/ai/knowledge-service.ts`
3. `src/lib/ai/payment-calculator.ts`

---

## Step 3: Build Realtime Offer Ingestion and Freshness (P0)
Status: In progress (stale-confidence guardrails + mutation revalidation added)

What to do:
1. Add ingestion pipeline for offer updates from verified sources.
2. Add freshness scoring and stale-data guardrails.
3. Add expiry automation and confidence-level updates.

Definition of done:
1. New offers can be ingested without manual redeploy.
2. Every offer has freshness/confidence and verification metadata.
3. AI refuses low-confidence stale recommendations or marks them clearly.

Primary systems:
1. Supabase scheduled jobs (`pg_cron`) or external worker scheduler.
2. Ingestion queue + validation layer.
3. Admin verification workflow.

---

## Step 4: Add Event-Driven Layer for Proactive Intelligence (P1)
Status: In progress (event outbox table + producer hooks added)

What to do:
1. Add queue-based event architecture for transaction and offer events.
2. Trigger proactive insights and notifications from events.
3. Add retry, dead-letter queue, and idempotency keys.

Definition of done:
1. Insight generation is event-driven, not only request-time.
2. Missed-savings insights are generated asynchronously.
3. Notification events are reliable and traceable.

Primary components:
1. Queue/worker layer (Redis queue or managed queue).
2. Event handlers for `transaction.created`, `offer.updated`, `offer.expiring`.
3. Notification service (email/push).

---

## Step 5: Create True Model Improvement Loop (P1)
Status: Not started

What to do:
1. Build evaluation dataset (golden question-answer set).
2. Add retrieval + recommendation quality metrics.
3. Run weekly evaluation and iterative model/ranking improvements.

Definition of done:
1. Offline eval dashboard exists with trend lines.
2. Retrieval quality and recommendation accuracy are measurable.
3. Release gating uses quality thresholds before production rollout.

Key metrics:
1. Retrieval precision@k, recall@k, MRR.
2. Recommendation savings error rate.
3. User-corrected recommendation rate.

---

## Step 6: Production Scale Hardening for 1M Users (P0/P1)
Status: Not started

What to do:
1. Replace in-memory rate limiting with distributed limiter (Redis/Upstash).
2. Add full observability: logs, traces, metrics, error budget.
3. Add load tests and chaos tests for peak traffic reliability.

Definition of done:
1. No single-instance bottlenecks in request path.
2. SLOs defined and monitored.
3. System passes load targets for projected 1M-user behavior.

Target readiness:
1. Read-heavy caching strategy in place.
2. Queue-based async workloads for heavy AI and ingestion.
3. Incident response runbook ready.

---

## Suggested Order (Execution)
1. Step 1 (correctness)
2. Step 2 (DB-first intelligence)
3. Step 6 (scale baseline)
4. Step 3 (realtime ingestion)
5. Step 4 (event-driven intelligence)
6. Step 5 (continuous model improvement)

---

## Founder Input Needed (Parallel)
You (CEO) continue data validation while engineering builds platform reliability:
1. Verified card reward structures from official sources.
2. Live offer verification snapshots.
3. Ground-truth examples where recommendations should differ by user profile.

Reference files:
1. `CEO_TASKS.md`
2. `CTO_PLAN.md`
3. `PROGRESS.md`

# PayWise — Real Model Training and Single-Agent Tiered Blueprint

Last updated: 14 March 2026
Audience: Founder, AI CTO, data and platform team
Goal: Build a production-grade Indian payment intelligence assistant for 1M users.

Execution update (Founder decision):
1. Build and stabilize the core model and real-time engine first.
2. Add Free and Pro tier behavior after core quality and reliability targets are met.

## 1. Core Principle
PayWise must not behave like a static API wrapper.
It must combine:
1. Verified financial knowledge.
2. Realtime data ingestion.
3. Deterministic payment calculations.
4. Continuously improving models.

---

## 2. Product Modes (One Core Agent, Two Access Tiers)

Current delivery order:
1. Core model + real-time product promise first.
2. Tier gating and packaging second.

Tier rollout rule:
1. Build one core agent workflow in development.
2. Do not split engineering effort into two separate agents.
3. Turn on Free and Pro restrictions/features only after core readiness gates pass.

Important clarification:
1. We are building one agent architecture.
2. Free and Pro use the same core recommendation workflow and same core intelligence stack.
3. Pro is not a different brain. Pro is higher limits, faster lanes, and advanced features.

Shared core workflow (both Free and Pro):
1. Input (text or image) -> entity extraction.
2. Retrieval (cards, UPI apps, offers, merchant rules).
3. Deterministic calculator computes exact savings.
4. LLM explains recommendation in natural language.
5. User sees confidence, freshness, and next action.

### Tier A: Free Access (Same Core Agent)
Input modes:
1. Typed query (text).
2. Screenshot/photo upload (checkout page, payment page, offer banner).

Output:
1. Best payment method with clear savings breakdown.
2. Confidence level and data freshness.
3. One-click next action.

Latency target:
1. P95 under 2.5s for text.
2. P95 under 4s for image+OCR.

Capabilities:
1. Merchant + amount extraction.
2. Offer-aware recommendation.
3. Basic personalization if profile exists.
4. Expense tracking and category insights.

Operational limits (example production policy):
1. Daily assistant queries: 10-20/day.
2. Image/screenshot queries: 3-5/day.
3. Voice: disabled or limited trial.
4. Background proactive alerts: basic only.
5. History retention: short window.

### Tier B: Pro Access (Same Core Agent)
Input modes:
1. Text and photo (all Free capabilities).
2. Voice interaction.
3. Proactive event-based guidance.

Output:
1. Faster, deeper optimization.
2. Multistep strategy suggestions (card + app + code + timing).
3. Voice-first assistant flow and alerts.

Latency target:
1. P95 under 1.2s for text recommendations.
2. Voice roundtrip under 1.8s after speech-to-text.

Pro-only capabilities:
1. Priority inference path.
2. Advanced personalization and prediction.
3. Proactive reminders and expiring-offer alerts.
4. Continuous background assistant mode.
5. Full voice assistant with selectable voices/languages.
6. Extended history and advanced analytics.

Operational limits (example production policy):
1. Daily assistant queries: high or fair-use unlimited.
2. Image/screenshot queries: high quota.
3. Voice sessions: enabled by default.
4. Background proactive alerts: fully enabled.
5. History retention: long window.

---

## 2.1 Core Product Promise (Non-Negotiable)
1. User can track spending and categories like a modern finance app.
2. Assistant always recommends best platform to pay (card + UPI + offer stack).
3. Assistant shows exact saving math, not generic suggestions.
4. Recommendations are offer-aware in real time.
5. If offer is revoked/expired, it must be removed quickly from recommendation path.
6. Calculator agent remains deterministic and real-time.

## 2.2 Core Readiness Gates (Before Tier Launch)
1. Recommendation accuracy on founder test set above agreed threshold.
2. Real-time offer revoke/update propagation working end-to-end.
3. Deterministic calculator used in all high-impact recommendation paths.
4. Expense tracking and category insights stable with correct totals.
5. OCR screenshot extraction reliable for top merchants.
6. Error budget and latency SLOs are consistently met.

---

## 3. End-to-End Flow (Text and Screenshot)

### Text flow
1. User asks: merchant + amount + app context.
2. Query parser extracts intent/entities.
3. Hybrid retrieval fetches relevant cards/apps/offers.
4. Deterministic calculator computes exact savings.
5. LLM formats response using calculator output.

### Screenshot/photo flow
1. Image upload.
2. OCR + layout parsing.
3. Merchant/app/amount/code extraction.
4. Retrieval + calculator + response generation.
5. Return confidence and fallback if OCR uncertain.

Minimum image pipeline components:
1. OCR engine (cloud OCR or on-device OCR for mobile).
2. Post-OCR parser tuned for Indian app UI text patterns.
3. Entity validator (merchant dictionary, amount sanity checks).

Expense tracking flow (all users):
1. Transaction capture (manual, import, or parsed screenshot/SMS).
2. Category mapping and payment-method attribution.
3. Missed-savings computation via calculator.
4. Dashboard updates (spent, saved, missed, recommended switch).

Background and voice flow (Pro):
1. Background listener detects context (checkout, bill, recurring payment event).
2. Real-time recommendation generated.
3. Voice output speaks recommendation in selected voice.
4. User can confirm, copy code, or open target payment app.

---

## 3.1 Real-Time Calculator and Offer Lifecycle

Calculator real-time requirements:
1. Reads from active offer + active knowledge tables only.
2. Applies validity window, caps, app/card eligibility, and confidence checks.
3. Recalculates immediately when offer state changes.

Offer lifecycle requirements:
1. Offer created -> available to recommendation engine after validation.
2. Offer updated -> cache invalidation + recalculation trigger.
3. Offer revoked/expired -> immediate deactivation from recommendations.
4. All responses include freshness metadata.

Recommended mechanisms:
1. Event trigger on offer insert/update/revoke.
2. Queue worker to invalidate caches and refresh ranking.
3. Scheduled consistency checks to catch stale rows.

---

## 3.2 Feature Continuity Checklist (Carry Forward From Previous Plans)

These features must remain in scope and must not regress while building the core model:
1. Expense tracking and transaction history.
2. Spending dashboard with category/app analytics.
3. Savings tracker and missed-savings visibility.
4. Ask assistant chat with context-aware answers.
5. Offer-aware recommendations with active-offer filtering.
6. Recommendation calculator with exact savings math.
7. Screenshot/photo input and extraction path.
8. Transaction import from statements/SMS text.
9. Proactive insights generation.
10. Admin knowledge management (cards, UPI apps, strategies).
11. Knowledge freshness metadata and confidence levels.
12. Hybrid retrieval (lexical + vector) and reranking.
13. Offer lifecycle handling (create/update/revoke/expire).
14. Auth, profile personalization, and onboarding data usage.
15. Security, auditability, and compliance controls.

If any item above is missing in implementation, it must be added before tier packaging.

---

## 4. Advanced RAG Architecture (Production)

Required retrieval stack:
1. Hybrid search: lexical + vector.
2. Re-ranking: merchant relevance + freshness + confidence.
3. Freshness-weighted retrieval: newer verified offers score higher.
4. Source-aware context builder: card rules, app rules, merchant offers.

Required metadata on every knowledge item:
1. `last_verified_date`
2. `confidence_level`
3. `source_url`
4. `verified_by`
5. `valid_from` / `valid_to`

Guardrails:
1. If confidence too low, AI must explicitly warn.
2. If data stale, AI must avoid hard claim and ask for verification.
3. Calculator output always wins over LLM-generated numbers.

---

## 5. Real Model Strategy (What to Train First)
Do not start by training a giant base LLM.
Start with high-impact domain models.

### Model 1: Merchant and Intent Classifier
Purpose:
1. Improve extraction beyond keyword matching.

Training data:
1. User queries and manually labeled intents/entities.
2. OCR text snippets from real screenshots.

### Model 2: Offer Validity and Quality Scorer
Purpose:
1. Rank likely valid offers higher.
2. Reduce stale/broken offer recommendations.

Training data:
1. Offer verification outcomes.
2. User feedback signals (worked/did not work).

### Model 3: Recommendation Ranker
Purpose:
1. Learn which recommendation actually leads to savings.

Training data:
1. Candidate recommendation sets + observed user outcome.
2. Click, usage, and realized cashback signals.

### Model 4: OCR Entity Post-Processor
Purpose:
1. Improve extracted merchant/app/amount quality from screenshots.

Training data:
1. OCR outputs + corrected labels.

---

## 6. True Training Loop (Continuous Improvement)

### Data loop
1. Collect interactions and outcomes.
2. Create labels from feedback and verified outcomes.
3. Train and evaluate models regularly.
4. Deploy only if quality gates pass.

### Cadence
1. Daily: data quality checks and drift alerts.
2. Weekly: retrain lightweight models (classifier/ranker).
3. Monthly: evaluate larger model updates and prompt/RAG changes.

### Quality gates before production
1. Retrieval precision/recall thresholds.
2. Recommendation savings error threshold.
3. Hallucination/safety checks.
4. Latency and cost budget checks.

---

## 7. 1M User Scale Blueprint

### Required platform capabilities
1. Distributed rate limiting (Redis/Upstash), not in-memory.
2. Queue-backed async workers for ingestion, OCR, insight generation.
3. Caching layers for hot merchants/offers/cards.
4. Read replicas and query optimization for heavy analytics.
5. Observability stack: metrics, logs, traces, SLO dashboards.

### Suggested SLOs
1. API availability: 99.9%.
2. Recommendation endpoint P95: under 1.5s.
3. Insight generation completion: under 30s async.
4. Failed recommendation rate: under 1%.

### Incident readiness
1. Runbooks for stale-data incidents.
2. Kill-switch for low-confidence recommendation paths.
3. Automated rollback for bad model/ranker deploys.

---

## 8. Security and Compliance Must-Haves
1. DPDP-ready consent and deletion flows.
2. Encryption for sensitive user financial profile data.
3. Strict audit logs for sensitive reads/writes.
4. Role-based admin workflows for knowledge updates.
5. Source provenance on all recommendations.

---

## 9. Founder Data Work (Your Role, Critical)
Your CEO work directly powers model quality.

You continue collecting:
1. Verified bank/card reward details.
2. Live app offers with validity windows.
3. Ground-truth examples of expected best payment methods.
4. Failure cases where current AI gives wrong advice.

How this maps to existing files:
1. `CEO_TASKS.md` = data acquisition and verification ops.
2. `CTO_PLAN.md` = system implementation plan.
3. `PROGRESS.md` = execution tracking.

---

## 10. 8-Week Execution Plan

### Weeks 1-2 (P0)
1. Fix schema correctness and import pipeline.
2. Enforce DB-first recommendation path.
3. Add freshness/confidence enforcement in outputs.

### Weeks 3-4 (P0/P1)
1. Launch image input MVP (OCR + extraction + recommendation).
2. Add distributed rate limiting + queue infrastructure.
3. Add observability baseline and SLO dashboards.

### Weeks 5-6 (P1)
1. Build first model loop: merchant/intent classifier.
2. Build first ranker for recommendation ordering.
3. Add offline evaluation harness and release gates.

### Weeks 7-8 (P1/P2)
1. Pro voice pipeline MVP.
2. Event-driven proactive recommendations.
3. Controlled rollout by user cohort.

---

## 11. What You Should Learn Next (Founder Priority)
1. RAG quality fundamentals: retrieval, reranking, freshness scoring.
2. Practical MLOps: dataset versioning, evaluation gates, rollback.
3. Product analytics for AI systems: outcome metrics over vanity metrics.
4. Financial data governance and compliance discipline.
5. Reliability engineering basics for 1M-user scale.

---

## 12. Final Rule for PayWise AI
Never let the model guess money.

Always:
1. Retrieve verified data.
2. Calculate deterministic savings.
3. Use model for reasoning and communication.

This is how PayWise becomes trustworthy, scalable, and category-defining in India.

---

## 13. Cost and Compute Overview (INR)

Note:
1. These are practical planning ranges, not exact invoices.
2. Actual cost depends on query volume, provider pricing, and traffic pattern.

### 13.1 Training Strategy Cost (Recommended)

Do this first (cheapest and safest):
1. Train small task models (intent/entity, offer quality scorer, ranker).
2. Keep large generative model as API-based inference.
3. Use deterministic calculator for financial accuracy.

Estimated one-time setup (first 2-3 months):
1. Data labeling and cleanup tooling: Rs. 10,000-40,000
2. Initial lightweight model training compute: Rs. 5,000-25,000
3. OCR pipeline integration and tuning: Rs. 10,000-35,000
4. Monitoring and evaluation setup: Rs. 10,000-30,000
5. Total initial build range: Rs. 35,000-1,30,000

Estimated monthly operating range (pre-scale):
1. Database + storage + egress: Rs. 5,000-25,000
2. Queue/cache/worker infra: Rs. 3,000-20,000
3. LLM and OCR API usage: Rs. 10,000-1,00,000
4. Retraining and eval compute: Rs. 3,000-20,000
5. Total monthly range: Rs. 21,000-1,65,000

### 13.2 If You Fine-Tune a 7B Model (Optional, Later)

When to do this:
1. Only after strong labeled data and stable eval pipeline.
2. Usually after PMF signals and consistent traffic.

Compute expectation:
1. LoRA/QLoRA run on rented high-memory GPU.
2. Typical training duration: 20-120 GPU hours depending dataset and epochs.

Approx compute cost range (cloud GPU rental):
1. Mid GPU path: Rs. 8,000-30,000 per training cycle.
2. High GPU path: Rs. 20,000-90,000 per training cycle.
3. Monthly retrain cadence (if weekly): Rs. 30,000-2,00,000.

### 13.3 Compute Power Requirement by Stage

Stage A (MVP to early growth):
1. No self-hosted LLM required.
2. 1 worker class + managed DB + vector search is enough.

Stage B (strong growth):
1. Add dedicated queue workers for OCR and ranking.
2. Add read replicas and stronger cache layer.

Stage C (toward 1M user base):
1. Multi-worker event architecture.
2. Distributed rate limiting and global cache strategy.
3. Optional partial self-hosting of small models for extraction/ranking.

---

## 14. Cheapest Path to Build the Best Product

Use this order to maximize quality per rupee:
1. Keep big LLM on API (do not train big model early).
2. Invest in data quality, freshness, and deterministic calculator.
3. Train only small high-impact models first.
4. Add advanced RAG + reranking before full LLM fine-tuning.
5. Introduce voice/background features after reliability baseline.

Why this is cheapest and best:
1. Accuracy comes from verified data + calculator, not expensive model size.
2. Training cost stays controlled while product quality improves quickly.
3. You can scale safely toward 1M users with predictable spend.

---

## 15. Time and Effort Plan (1 / 2 / 3 Month Options)

### Option A: 1-Month Intensive Foundation
Effort: 30-40 hours/week

Deliverables:
1. Correct schema + import correctness.
2. DB-first calculator path.
3. Offer lifecycle basics (create/update/revoke propagation).
4. Free assistant stable for text + basic expense tracking.

Budget range (month): Rs. 40,000-1,20,000

### Option B: 2-Month Build (Recommended)
Effort: 25-35 hours/week

Deliverables:
1. Everything from Option A.
2. Screenshot/photo input MVP.
3. Queue-based recalculation and stale-offer handling.
4. Pro tier: faster path + richer analytics + higher limits.
5. Evaluation loop for small models.

Budget range (2 months): Rs. 1,00,000-2,80,000

### Option C: 3-Month Production-Grade Launch Track
Effort: 20-35 hours/week

Deliverables:
1. Everything from Option B.
2. Voice integration (Pro) + background proactive events.
3. Better reliability, observability, and SLO operations.
4. First continuous retraining loop in production.

Budget range (3 months): Rs. 2,00,000-5,50,000

---

## 16. Accuracy Operations Checklist (Must Run Weekly)
1. Validate top merchants and top cards against live sources.
2. Review revoked/expired offers and purge recommendation cache.
3. Compare predicted savings vs actual user outcomes.
4. Audit wrong recommendations and add them to retraining data.
5. Verify calculator outputs for high-traffic merchants.

This keeps PayWise correct, real-time, and trustworthy.

---

## 17. Founder Execution Plan (What You Should Do Now)

Yes. Your highest-value work right now is collecting and validating real data.
AI engineering can only be as good as your verified inputs.

### 17.1 Your Primary Job (Data and Ground Truth)
1. Collect verified card reward data from official bank sources.
2. Collect live offer data from payment apps and merchant checkout flows.
3. Create ground-truth expected answers for common payment scenarios.
4. Document where current recommendations are wrong and why.

### 17.2 Daily Work (60-120 minutes)
1. Verify at least 5-10 live offers with validity windows.
2. Capture screenshots and source links for each offer.
3. Record one revoked/expired offer example if found.
4. Add 5 user-like test prompts and expected best payment outcome.

### 17.3 Weekly Work
1. Validate top 20 merchants and top 15 cards for freshness.
2. Review wrong recommendations and classify root cause:
	1. Data stale
	2. Retrieval miss
	3. Calculator rule gap
	4. OCR/entity extraction miss
3. Share one consolidated founder dataset package for engineering update.

### 17.4 What AI CTO Should Do in Parallel (Code)
1. Schema correctness and import stability.
2. DB-first calculator and recommendation path.
3. Real-time offer lifecycle propagation.
4. OCR and extraction quality improvements.
5. Evaluation harness and weekly quality reporting.

### 17.5 Input-Output Contract Between Founder and Engineering
Founder gives:
1. Verified data with source evidence.
2. Expected output for test scenarios.

Engineering returns:
1. Measurable accuracy improvements.
2. Faster and more correct recommendations.
3. Clear failure logs for next data collection cycle.

This loop is how PayWise becomes real, reliable, and category-leading.

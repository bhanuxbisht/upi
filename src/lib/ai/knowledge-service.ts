/**
 * Knowledge Service — Smart Retrieval from Supabase
 * 
 * Phase 3 Build 3-4: Full-text search + vector similarity search
 * 
 * RETRIEVAL HIERARCHY (best → fallback):
 * 1. Vector similarity search (semantic — "eating out" matches "food-delivery")
 * 2. Full-text search (keyword — fast, PostgreSQL native)
 * 3. Fetch-all filtered by intent (Phase 3 Build 1-2 — original approach)
 * 4. TypeScript hardcoded data (safety net)
 * 
 * The AI gets ONLY the relevant knowledge items, not the entire database.
 * This reduces token usage AND improves response quality.
 */

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { generateEmbedding } from "./embedding-service";

// Import TypeScript data as fallback
import { CREDIT_CARDS, type CreditCard } from "./knowledge/credit-cards";
import { UPI_APPS, type UPIAppProfile } from "./knowledge/upi-apps";
import {
    OFFER_STACKING_STRATEGIES,
    type Strategy,
} from "./knowledge/payment-strategies";

// ============================================================
// CREDIT CARDS
// ============================================================

interface DBCreditCard {
    id: string;
    bank: string;
    name: string;
    annual_fee: number;
    fee_waiver: string | null;
    joining_fee: number;
    network: string;
    tier: string;
    rewards: Array<{
        category: string;
        rewardRate: number;
        rewardType: string;
        pointsPerRupee?: number;
        pointValue?: number;
        cap?: number;
        minSpend?: number;
        notes?: string;
    }>;
    lounge_access: string | null;
    fuel_surcharge_waiver: boolean;
    best_for: string[];
    affiliate_link: string | null;
    affiliate_payout: number | null;
    income_requirement: string | null;
    pros: string[];
    cons: string[];
    is_active: boolean;
}

/**
 * Convert DB row to the CreditCard interface the query analyzer expects
 */
function dbToCreditCard(row: DBCreditCard): CreditCard {
    return {
        id: row.id,
        bank: row.bank,
        name: row.name,
        annualFee: Number(row.annual_fee),
        feeWaiver: row.fee_waiver || undefined,
        joiningFee: Number(row.joining_fee),
        network: row.network as CreditCard["network"],
        tier: row.tier as CreditCard["tier"],
        rewards: (row.rewards || []).map((r) => ({
            category: r.category,
            rewardRate: r.rewardRate,
            rewardType: r.rewardType as "cashback" | "points" | "miles",
            pointsPerRupee: r.pointsPerRupee,
            pointValue: r.pointValue,
            cap: r.cap,
            minSpend: r.minSpend,
            notes: r.notes,
        })),
        loungeAccess: row.lounge_access || undefined,
        fuelSurchargeWaiver: row.fuel_surcharge_waiver,
        bestFor: row.best_for || [],
        affiliateLink: row.affiliate_link || undefined,
        affiliatePayout: row.affiliate_payout || undefined,
        incomeRequirement: row.income_requirement || undefined,
        pros: row.pros || [],
        cons: row.cons || [],
    };
}

/**
 * Get all active credit cards from Supabase, fallback to TypeScript
 */
export async function getCreditCards(): Promise<CreditCard[]> {
    try {
        const supabase = await getSupabaseServerClient();
        const { data, error } = await supabase
            .from("knowledge_credit_cards")
            .select("*")
            .eq("is_active", true)
            .order("bank");

        if (error || !data || data.length === 0) {
            console.warn("[KnowledgeService] Falling back to TypeScript credit cards:", error?.message || "no data");
            return CREDIT_CARDS;
        }

        return data.map((row: DBCreditCard) => dbToCreditCard(row));
    } catch {
        console.warn("[KnowledgeService] DB unavailable, using TypeScript credit cards");
        return CREDIT_CARDS;
    }
}

// ============================================================
// UPI APPS
// ============================================================

interface DBUPIApp {
    id: string;
    name: string;
    slug: string;
    market_share: number;
    monthly_active_users: string;
    color: string;
    strength_categories: string[];
    weak_categories: string[];
    reward_tiers: UPIAppProfile["rewardTiers"];
    linked_card_benefits: string[];
    strategies: string[];
    recurring_payment_support: boolean;
    auto_pay_support: boolean;
    credit_card_link_support: boolean;
    split_bill_support: boolean;
    is_active: boolean;
}

function dbToUPIApp(row: DBUPIApp): UPIAppProfile {
    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        marketShare: Number(row.market_share),
        monthlyActiveUsers: row.monthly_active_users || "",
        color: row.color,
        strengthCategories: row.strength_categories || [],
        weakCategories: row.weak_categories || [],
        rewardTiers: row.reward_tiers || [],
        linkedCardBenefits: row.linked_card_benefits || [],
        strategies: row.strategies || [],
        recurringPaymentSupport: row.recurring_payment_support,
        autoPaySupport: row.auto_pay_support,
        creditCardLinkSupport: row.credit_card_link_support,
        splitBillSupport: row.split_bill_support,
    };
}

/**
 * Get all active UPI apps from Supabase, fallback to TypeScript
 */
export async function getUPIApps(): Promise<UPIAppProfile[]> {
    try {
        const supabase = await getSupabaseServerClient();
        const { data, error } = await supabase
            .from("knowledge_upi_apps")
            .select("*")
            .eq("is_active", true)
            .order("market_share", { ascending: false });

        if (error || !data || data.length === 0) {
            console.warn("[KnowledgeService] Falling back to TypeScript UPI apps:", error?.message || "no data");
            return UPI_APPS;
        }

        return data.map((row: DBUPIApp) => dbToUPIApp(row));
    } catch {
        console.warn("[KnowledgeService] DB unavailable, using TypeScript UPI apps");
        return UPI_APPS;
    }
}

// ============================================================
// STRATEGIES
// ============================================================

interface DBStrategy {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    monthly_savings_min: number;
    monthly_savings_max: number;
    steps: string[];
    requirements: string[];
    warnings: string[];
    applicable_to: string[];
    is_active: boolean;
}

function dbToStrategy(row: DBStrategy): Strategy {
    return {
        id: row.id,
        title: row.title,
        category: row.category,
        difficulty: row.difficulty as "easy" | "medium" | "advanced",
        monthlySavingsPotential: {
            min: Number(row.monthly_savings_min),
            max: Number(row.monthly_savings_max),
        },
        steps: row.steps || [],
        requirements: row.requirements || [],
        warnings: row.warnings || [],
        applicableTo: row.applicable_to || [],
    };
}

/**
 * Get all active strategies from Supabase, fallback to TypeScript
 */
export async function getStrategies(): Promise<Strategy[]> {
    try {
        const supabase = await getSupabaseServerClient();
        const { data, error } = await supabase
            .from("knowledge_strategies")
            .select("*")
            .eq("is_active", true)
            .order("category");

        if (error || !data || data.length === 0) {
            console.warn("[KnowledgeService] Falling back to TypeScript strategies:", error?.message || "no data");
            return OFFER_STACKING_STRATEGIES;
        }

        return data.map((row: DBStrategy) => dbToStrategy(row));
    } catch {
        console.warn("[KnowledgeService] DB unavailable, using TypeScript strategies");
        return OFFER_STACKING_STRATEGIES;
    }
}

// ============================================================
// AGGREGATED CONTEXT — Build rich knowledge for AI
// ============================================================

/**
 * Build a complete knowledge context from Supabase data.
 * This gives the LLM ALL knowledge to work with, not just query-specific.
 * The LLM can then pick what's relevant — better than our regex-based routing.
 */
export async function buildDatabaseKnowledgeContext(
    intent: string,
    categories: string[],
    merchants: string[]
): Promise<string> {
    const parts: string[] = [];

    try {
        // Fetch all knowledge in parallel
        const [creditCards, upiApps, strategies] = await Promise.all([
            getCreditCards(),
            getUPIApps(),
            getStrategies(),
        ]);

        // Credit card summary
        if (intent === "card_recommendation" || intent === "payment_recommendation" || intent === "reward_maximization" || intent === "rent_payment" || intent === "merchant_specific") {
            parts.push("[CREDIT CARD DATABASE — Latest verified data:]");
            for (const card of creditCards) {
                const topReward = card.rewards.sort((a, b) => b.rewardRate - a.rewardRate)[0];
                const rewardSummary = card.rewards.map((r) => `${r.category}: ${r.rewardRate}% ${r.rewardType}`).join(", ");
                parts.push(`- ${card.bank} ${card.name} (${card.tier}, ${card.network}): Fee ₹${card.annualFee}${card.feeWaiver ? ` (${card.feeWaiver})` : ""}. Best rate: ${topReward?.rewardRate || 0}% ${topReward?.rewardType || ""}. Categories: ${rewardSummary}. Best for: ${card.bestFor.join(", ")}`);
            }
        }

        // UPI app summary
        if (intent === "payment_recommendation" || intent === "compare_apps" || intent === "bill_optimization" || intent === "reward_maximization" || intent === "merchant_specific") {
            parts.push("\n[UPI APP DATABASE — Latest verified data:]");
            for (const app of upiApps) {
                parts.push(`- ${app.name} (${app.marketShare}% share): Strong in ${app.strengthCategories.join(", ")}. CC link: ${app.creditCardLinkSupport ? "Yes" : "No"}. Tips: ${app.strategies.slice(0, 2).join(" | ")}`);
            }
        }

        // Strategies
        if (intent === "offer_stacking" || intent === "payment_recommendation" || intent === "bill_optimization" || intent === "rent_payment" || intent === "reward_maximization" || intent === "monthly_routine" || intent === "general_advice") {
            const relevantStrategies = categories.length > 0
                ? strategies.filter((s) => categories.includes(s.category))
                : strategies;

            if (relevantStrategies.length > 0) {
                parts.push("\n[PAYMENT STRATEGIES — Tested & verified:]");
                for (const strat of relevantStrategies.slice(0, 5)) {
                    parts.push(`\n${strat.title} (${strat.difficulty}, saves ₹${strat.monthlySavingsPotential.min}-${strat.monthlySavingsPotential.max}/mo):`);
                    strat.steps.forEach((step) => parts.push(`  ${step}`));
                    if (strat.warnings?.length) parts.push(`  ⚠️ ${strat.warnings.join("; ")}`);
                }
            }
        }

        if (parts.length === 0) {
            parts.push("[Knowledge database is available but no specific data matched this query intent.]");
        }
    } catch (err) {
        console.warn("[KnowledgeService] Failed to build DB knowledge context:", err);
        parts.push("[Knowledge database unavailable — using fallback data.]");
    }

    return parts.join("\n");
}


// ============================================================
// SMART RETRIEVAL — Phase 3, Build 3-4
// Full-text search + Vector search + Offer injection
// ============================================================

interface SearchResult {
    source: string;
    item_id: string;
    title: string;
    relevance: number;
}

interface ActiveOffer {
    offer_id: string;
    merchant_name: string;
    app_name: string;
    offer_type: string;
    title: string;
    description: string;
    cashback_amount: number | null;
    cashback_percent: number | null;
    max_cashback: number | null;
    min_transaction: number | null;
    promo_code: string | null;
    valid_to: string;
    verified_count: number;
}

/**
 * FULL-TEXT SEARCH — Keyword matching with PostgreSQL tsvector
 * Fast, free, already in Supabase. Massive upgrade over regex.
 */
async function fullTextSearch(query: string, limit: number = 10): Promise<SearchResult[]> {
    try {
        const supabase = await getSupabaseServerClient();
        const { data, error } = await supabase.rpc("search_knowledge", {
            query_text: query,
            match_limit: limit,
        });

        if (error) {
            console.warn("[KnowledgeService] Full-text search failed:", error.message);
            return [];
        }

        return (data || []) as SearchResult[];
    } catch {
        console.warn("[KnowledgeService] Full-text search unavailable");
        return [];
    }
}

/**
 * VECTOR SEARCH — Semantic similarity with pgvector
 * "eating out" matches "food-delivery" because vectors are close.
 * Requires embeddings to be generated first (via admin API).
 */
async function vectorSearch(query: string, limit: number = 10, threshold: number = 0.3): Promise<SearchResult[]> {
    try {
        // Generate embedding for the user's query
        const queryEmbedding = await generateEmbedding(query);
        
        const supabase = await getSupabaseServerClient();
        const { data, error } = await supabase.rpc("search_knowledge_vectors", {
            query_embedding: JSON.stringify(queryEmbedding),
            match_limit: limit,
            similarity_threshold: threshold,
        });

        if (error) {
            console.warn("[KnowledgeService] Vector search failed:", error.message);
            return [];
        }

        return (data || []).map((item: { source: string; item_id: string; title: string; similarity: number }) => ({
            source: item.source,
            item_id: item.item_id,
            title: item.title,
            relevance: item.similarity,
        }));
    } catch (err) {
        console.warn("[KnowledgeService] Vector search unavailable:", err instanceof Error ? err.message : "");
        return [];
    }
}

/**
 * HYBRID SEARCH — Combines full-text + vector results
 * Deduplicates and re-ranks by combined score.
 * Falls back gracefully if either search type fails.
 */
async function hybridSearch(query: string, limit: number = 8): Promise<SearchResult[]> {
    // Run both searches in parallel
    const [textResults, vecResults] = await Promise.all([
        fullTextSearch(query, limit),
        vectorSearch(query, limit),
    ]);

    // Merge and deduplicate by item_id + source
    const seen = new Map<string, SearchResult>();
    
    // Text results get a slight boost for exact matches
    for (const r of textResults) {
        const key = `${r.source}:${r.item_id}`;
        seen.set(key, { ...r, relevance: r.relevance * 1.1 });
    }
    
    // Vector results — if already found via text search, boost score
    for (const r of vecResults) {
        const key = `${r.source}:${r.item_id}`;
        const existing = seen.get(key);
        if (existing) {
            // Found in both — very relevant, boost score
            existing.relevance = Math.max(existing.relevance, r.relevance) * 1.2;
        } else {
            seen.set(key, r);
        }
    }

    // Sort by relevance and return top results
    return Array.from(seen.values())
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, limit);
}

/**
 * SEARCH ACTIVE OFFERS — Find live offers matching the query context
 * This is what makes the AI actually useful — it knows what deals are live RIGHT NOW.
 */
async function searchActiveOffers(
    merchants: string[],
    categories: string[],
    apps: string[],
    queryText: string = "",
    limit: number = 5
): Promise<ActiveOffer[]> {
    try {
        const supabase = await getSupabaseServerClient();
        
        // Convert merchant names to slugs
        const merchantSlugs = merchants.map(m => m.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
        const categorySlugs = categories;
        const appSlugs = apps.map(a => a.toLowerCase().replace(/\s+/g, "-"));

        const { data, error } = await supabase.rpc("search_active_offers", {
            merchant_slugs: merchantSlugs,
            category_slugs: categorySlugs,
            app_slugs: appSlugs,
            search_text: queryText,
            match_limit: limit,
        });

        if (error) {
            console.warn("[KnowledgeService] Offer search failed:", error.message);
            return [];
        }

        return (data || []) as ActiveOffer[];
    } catch {
        console.warn("[KnowledgeService] Offer search unavailable");
        return [];
    }
}

/**
 * Fetch specific knowledge items by their IDs (from search results).
 * Only loads the items that matched — not the entire database.
 */
async function fetchKnowledgeByIds(
    results: SearchResult[]
): Promise<{ cards: CreditCard[]; apps: UPIAppProfile[]; strategies: Strategy[] }> {
    const cardIds = results.filter(r => r.source === "credit_card").map(r => r.item_id);
    const appIds = results.filter(r => r.source === "upi_app").map(r => r.item_id);
    const stratIds = results.filter(r => r.source === "strategy").map(r => r.item_id);

    const supabase = await getSupabaseServerClient();
    const cards: CreditCard[] = [];
    const apps: UPIAppProfile[] = [];
    const strategies: Strategy[] = [];

    // Fetch matching items in parallel
    const fetches: Promise<void>[] = [];

    if (cardIds.length > 0) {
        fetches.push(
            (async () => {
                const { data } = await supabase
                    .from("knowledge_credit_cards")
                    .select("*")
                    .in("id", cardIds);
                if (data) {
                    cards.push(...data.map((row: DBCreditCard) => dbToCreditCard(row)));
                }
            })()
        );
    }

    if (appIds.length > 0) {
        fetches.push(
            (async () => {
                const { data } = await supabase
                    .from("knowledge_upi_apps")
                    .select("*")
                    .in("id", appIds);
                if (data) {
                    apps.push(...data.map((row: DBUPIApp) => dbToUPIApp(row)));
                }
            })()
        );
    }

    if (stratIds.length > 0) {
        fetches.push(
            (async () => {
                const { data } = await supabase
                    .from("knowledge_strategies")
                    .select("*")
                    .in("id", stratIds);
                if (data) {
                    strategies.push(...data.map((row: DBStrategy) => dbToStrategy(row)));
                }
            })()
        );
    }

    await Promise.all(fetches);
    return { cards, apps, strategies };
}

/**
 * FORMAT knowledge items into a context string for the LLM.
 * This is the final output that gets injected into the prompt.
 */
function formatKnowledgeForLLM(
    cards: CreditCard[],
    apps: UPIAppProfile[],
    strategies: Strategy[],
    offers: ActiveOffer[]
): string {
    const parts: string[] = [];

    if (cards.length > 0) {
        parts.push("[RELEVANT CREDIT CARDS — Verified data:]");
        for (const card of cards) {
            const rewardSummary = card.rewards
                .sort((a, b) => b.rewardRate - a.rewardRate)
                .map(r => `${r.category}: ${r.rewardRate}% ${r.rewardType}`)
                .join(", ");
            parts.push(`- ${card.bank} ${card.name} (${card.tier}, ${card.network}): Fee ₹${card.annualFee}${card.feeWaiver ? ` (${card.feeWaiver})` : ""}. Rewards: ${rewardSummary}. Best for: ${card.bestFor.join(", ")}. Pros: ${card.pros.join("; ")}`);
        }
    }

    if (apps.length > 0) {
        parts.push("\n[RELEVANT UPI APPS — Verified data:]");
        for (const app of apps) {
            parts.push(`- ${app.name} (${app.marketShare}% share): Strong in ${app.strengthCategories.join(", ")}. CC link: ${app.creditCardLinkSupport ? "Yes" : "No"}. Tips: ${app.strategies.slice(0, 3).join(" | ")}`);
        }
    }

    if (strategies.length > 0) {
        parts.push("\n[RELEVANT STRATEGIES — Tested & verified:]");
        for (const strat of strategies) {
            parts.push(`\n${strat.title} (${strat.difficulty}, saves ₹${strat.monthlySavingsPotential.min}-${strat.monthlySavingsPotential.max}/mo):`);
            strat.steps.forEach(step => parts.push(`  ${step}`));
            if (strat.warnings?.length) parts.push(`  Warning: ${strat.warnings.join("; ")}`);
        }
    }

    if (offers.length > 0) {
        parts.push("\n[LIVE OFFERS ON PAYWISE — Active right now:]");
        for (const offer of offers) {
            const value = offer.cashback_amount 
                ? `₹${offer.cashback_amount} ${offer.offer_type}`
                : offer.cashback_percent 
                    ? `${offer.cashback_percent}% ${offer.offer_type}${offer.max_cashback ? ` (max ₹${offer.max_cashback})` : ""}`
                    : offer.offer_type;
            const promo = offer.promo_code ? ` Code: ${offer.promo_code}` : "";
            const minTxn = offer.min_transaction ? ` Min ₹${offer.min_transaction}.` : "";
            const expires = new Date(offer.valid_to);
            const daysLeft = Math.ceil((expires.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            parts.push(`- ${offer.merchant_name} x ${offer.app_name}: ${offer.title} — ${value}.${minTxn}${promo} (${daysLeft} days left, ${offer.verified_count} verified)`);
        }
        parts.push("[IMPORTANT: Mention these live offers in your response! They're on our platform RIGHT NOW.]");
    }

    return parts.join("\n");
}

/**
 * SMART KNOWLEDGE CONTEXT — The main function for Phase 3 Build 3-4
 * 
 * This replaces the old buildDatabaseKnowledgeContext for the context builder.
 * Uses hybrid search (full-text + vector) to find ONLY relevant knowledge,
 * then injects matching live offers. Much smarter than fetch-all.
 */
export async function buildSmartKnowledgeContext(
    userQuery: string,
    intent: string,
    categories: string[],
    merchants: string[],
    paymentApps: string[]
): Promise<string> {
    try {
        // 1. Search for relevant knowledge items
        const searchResults = await hybridSearch(userQuery, 8);
        
        // 2. Search for active offers matching the context
        const offers = await searchActiveOffers(merchants, categories, paymentApps, userQuery, 5);
        
        // 3. If search found results, fetch full knowledge items
        if (searchResults.length > 0 || offers.length > 0) {
            let cards: CreditCard[] = [];
            let apps: UPIAppProfile[] = [];
            let strategies: Strategy[] = [];
            
            if (searchResults.length > 0) {
                const knowledge = await fetchKnowledgeByIds(searchResults);
                cards = knowledge.cards;
                apps = knowledge.apps;
                strategies = knowledge.strategies;
            }
            
            const context = formatKnowledgeForLLM(cards, apps, strategies, offers);
            
            if (context.trim()) {
                return `[SMART RETRIEVAL — ${searchResults.length} knowledge items + ${offers.length} live offers found]\n\n${context}`;
            }
        }

        // 4. If smart search returned nothing, fall back to intent-based fetch-all
        console.warn("[KnowledgeService] Smart search returned no results, falling back to intent-based retrieval");
        return await buildDatabaseKnowledgeContext(intent, categories, merchants);
        
    } catch (err) {
        console.warn("[KnowledgeService] Smart retrieval failed:", err instanceof Error ? err.message : "");
        // Fall back to the old method
        return await buildDatabaseKnowledgeContext(intent, categories, merchants);
    }
}

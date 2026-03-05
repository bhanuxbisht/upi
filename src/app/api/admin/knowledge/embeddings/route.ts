/**
 * Admin API — Generate & Store Embeddings for Knowledge Data
 * POST: Generates embeddings for all knowledge items and stores them in Supabase
 * 
 * This is a one-time (or periodic) operation. Run it after seeding data.
 * Uses Hugging Face free API — no cost, no training.
 */

import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import {
    generateEmbedding,
    buildCreditCardText,
    buildUPIAppText,
    buildStrategyText,
} from "@/lib/ai/embedding-service";

export async function POST() {
    const auth = await verifyAdmin();
    if ("error" in auth) {
        return auth.error;
    }

    const { supabase } = auth;
    const results = { creditCards: 0, upiApps: 0, strategies: 0, errors: [] as string[] };

    try {
        // 1. Embed credit cards
        const { data: cards } = await supabase
            .from("knowledge_credit_cards")
            .select("*")
            .eq("is_active", true);

        if (cards) {
            for (const card of cards) {
                try {
                    const text = buildCreditCardText({
                        bank: card.bank,
                        name: card.name,
                        tier: card.tier,
                        network: card.network,
                        bestFor: card.best_for || [],
                        rewards: card.rewards || [],
                        pros: card.pros || [],
                        annualFee: card.annual_fee,
                    });
                    const embedding = await generateEmbedding(text);
                    
                    const { error } = await supabase
                        .from("knowledge_credit_cards")
                        .update({ embedding: JSON.stringify(embedding) })
                        .eq("id", card.id);
                    
                    if (error) {
                        results.errors.push(`CC ${card.id}: ${error.message}`);
                    } else {
                        results.creditCards++;
                    }
                    
                    // Small delay to respect rate limits
                    await new Promise(r => setTimeout(r, 200));
                } catch (err) {
                    results.errors.push(`CC ${card.id}: ${err instanceof Error ? err.message : String(err)}`);
                }
            }
        }

        // 2. Embed UPI apps
        const { data: apps } = await supabase
            .from("knowledge_upi_apps")
            .select("*")
            .eq("is_active", true);

        if (apps) {
            for (const app of apps) {
                try {
                    const text = buildUPIAppText({
                        name: app.name,
                        strengthCategories: app.strength_categories || [],
                        weakCategories: app.weak_categories || [],
                        strategies: app.strategies || [],
                        creditCardLinkSupport: app.credit_card_link_support,
                        splitBillSupport: app.split_bill_support,
                    });
                    const embedding = await generateEmbedding(text);
                    
                    const { error } = await supabase
                        .from("knowledge_upi_apps")
                        .update({ embedding: JSON.stringify(embedding) })
                        .eq("id", app.id);
                    
                    if (error) {
                        results.errors.push(`UPI ${app.id}: ${error.message}`);
                    } else {
                        results.upiApps++;
                    }
                    
                    await new Promise(r => setTimeout(r, 200));
                } catch (err) {
                    results.errors.push(`UPI ${app.id}: ${err instanceof Error ? err.message : String(err)}`);
                }
            }
        }

        // 3. Embed strategies
        const { data: strategies } = await supabase
            .from("knowledge_strategies")
            .select("*")
            .eq("is_active", true);

        if (strategies) {
            for (const strat of strategies) {
                try {
                    const text = buildStrategyText({
                        title: strat.title,
                        category: strat.category,
                        difficulty: strat.difficulty,
                        steps: strat.steps || [],
                        applicableTo: strat.applicable_to || [],
                    });
                    const embedding = await generateEmbedding(text);
                    
                    const { error } = await supabase
                        .from("knowledge_strategies")
                        .update({ embedding: JSON.stringify(embedding) })
                        .eq("id", strat.id);
                    
                    if (error) {
                        results.errors.push(`Strategy ${strat.id}: ${error.message}`);
                    } else {
                        results.strategies++;
                    }
                    
                    await new Promise(r => setTimeout(r, 200));
                } catch (err) {
                    results.errors.push(`Strategy ${strat.id}: ${err instanceof Error ? err.message : String(err)}`);
                }
            }
        }

        return NextResponse.json({
            success: true,
            embedded: {
                creditCards: results.creditCards,
                upiApps: results.upiApps,
                strategies: results.strategies,
                total: results.creditCards + results.upiApps + results.strategies,
            },
            errors: results.errors.length > 0 ? results.errors : undefined,
        });

    } catch (error) {
        console.error("[Embeddings] Generation failed:", error);
        return NextResponse.json(
            { error: "Embedding generation failed", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

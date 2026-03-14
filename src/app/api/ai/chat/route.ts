/**
 * AI Chat API Route — "Ask PayWise"
 * POST: Send a message, get AI response
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { chatWithPayWise, type ChatMessage } from "@/lib/ai/gemini";
import { buildUserContext } from "@/lib/ai/context-builder";
import { getKnowledgeFreshnessSnapshot, type KnowledgeFreshnessSnapshot } from "@/lib/ai/knowledge-service";
import { checkAIUsageLimit, incrementAIUsage } from "@/services/profiles";
import { logAudit } from "@/lib/security/audit";
import { createRateLimiter } from "@/lib/rate-limit";
import { z } from "zod";

const rateLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });

const chatSchema = z.object({
    message: z.string().min(1, "Message is required").max(2000, "Message too long"),
    conversationId: z.string().uuid().optional().nullable(),
});

function formatKnowledgeFreshnessForContext(snapshot: KnowledgeFreshnessSnapshot): string {
    const lines = [
        "--- KNOWLEDGE FRESHNESS METADATA ---",
        `Generated at: ${snapshot.generatedAt}`,
        `Knowledge source mode: ${snapshot.overallSource}`,
        `Credit cards: source=${snapshot.creditCards.source}, active=${snapshot.creditCards.activeCount}, last_verified=${snapshot.creditCards.lastVerifiedAt || "unknown"}, low_confidence=${snapshot.creditCards.lowConfidenceCount}`,
        `UPI apps: source=${snapshot.upiApps.source}, active=${snapshot.upiApps.activeCount}, last_verified=${snapshot.upiApps.lastVerifiedAt || "unknown"}, low_confidence=${snapshot.upiApps.lowConfidenceCount}`,
        `Strategies: source=${snapshot.strategies.source}, active=${snapshot.strategies.activeCount}, last_verified=${snapshot.strategies.lastVerifiedAt || "unknown"}, low_confidence=${snapshot.strategies.lowConfidenceCount}`,
        "If source is fallback or low_confidence is high, clearly mark recommendations as tentative.",
    ];

    return lines.join("\n");
}

export async function POST(request: NextRequest) {
    try {
        // Auth check
        const supabase = await getSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Authentication required. Please log in." },
                { status: 401 }
            );
        }

        // Rate limit
        const rateLimitResult = rateLimiter.check(user.id);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                { error: "Too many requests. Please wait a moment." },
                { status: 429, headers: { "Retry-After": String(rateLimitResult.retryAfterSeconds || 60) } }
            );
        }

        // Check AI usage limits (Free: 3/day, Pro: unlimited)
        const usageLimit = await checkAIUsageLimit(user.id);
        if (!usageLimit.allowed) {
            return NextResponse.json(
                {
                    error: "Daily AI query limit reached",
                    used: usageLimit.used,
                    limit: usageLimit.limit,
                    upgrade: true,
                    message: `You've used all ${usageLimit.limit} free AI queries today. Upgrade to PayWise Pro for unlimited access!`,
                },
                { status: 429 }
            );
        }

        // Parse and validate input
        const body = await request.json();
        const parsed = chatSchema.safeParse(body);

        if (!parsed.success) {
            console.error("[AI Chat] Validation failed:", parsed.error.flatten());
            return NextResponse.json(
                { error: "Invalid input", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { message, conversationId: rawConversationId } = parsed.data;
        // Normalize null/undefined to undefined
        const conversationId = rawConversationId || undefined;

        // Load conversation history if continuing
        let history: ChatMessage[] = [];
        let activeConversationId = conversationId;

        if (conversationId) {
            const { data: conversation } = await supabase
                .from("ai_conversations")
                .select("messages")
                .eq("id", conversationId)
                .eq("user_id", user.id)
                .single();

            if (conversation?.messages) {
                history = conversation.messages as ChatMessage[];
            }
        }

        // Build user context (resilient — returns empty string on failure)
        // Now includes KNOWLEDGE INJECTION based on the user's query
        let userContext = "";
        let knowledgeFreshness: KnowledgeFreshnessSnapshot | null = null;

        const [contextResult, freshnessResult] = await Promise.allSettled([
            buildUserContext(user.id, message),
            getKnowledgeFreshnessSnapshot(),
        ]);

        if (contextResult.status === "fulfilled") {
            userContext = contextResult.value;
        } else {
            console.warn("[AI Chat] Context build failed, continuing without context:", contextResult.reason);
        }

        if (freshnessResult.status === "fulfilled") {
            knowledgeFreshness = freshnessResult.value;
            const freshnessContext = formatKnowledgeFreshnessForContext(knowledgeFreshness);
            userContext = [userContext, freshnessContext].filter(Boolean).join("\n\n");
        } else {
            console.warn("[AI Chat] Knowledge freshness snapshot failed:", freshnessResult.reason);
        }

        // Get AI response
        const aiResponse = await chatWithPayWise(message, history, userContext);

        // Save conversation (resilient — don't block AI response)
        try {
            const now = new Date().toISOString();
            const newHistory: ChatMessage[] = [
                ...history,
                { role: "user", content: message, timestamp: now },
                { role: "model", content: aiResponse.response, timestamp: now },
            ];

            if (activeConversationId) {
                await supabase
                    .from("ai_conversations")
                    .update({
                        messages: newHistory,
                        updated_at: now,
                        total_tokens_used: aiResponse.tokensUsed,
                    })
                    .eq("id", activeConversationId)
                    .eq("user_id", user.id);
            } else {
                const title =
                    message.length > 50 ? message.slice(0, 50) + "..." : message;

                const { data: newConv } = await supabase
                    .from("ai_conversations")
                    .insert({
                        user_id: user.id,
                        title,
                        messages: newHistory,
                        total_tokens_used: aiResponse.tokensUsed,
                    })
                    .select("id")
                    .single();

                activeConversationId = newConv?.id;
            }
        } catch (saveError) {
            console.warn("[AI Chat] Failed to save conversation:", saveError);
        }

        // Track usage (resilient)
        try {
            await incrementAIUsage(user.id, aiResponse.tokensUsed);
        } catch (usageError) {
            console.warn("[AI Chat] Failed to increment usage:", usageError);
        }

        // Audit log (resilient)
        try {
            await logAudit({
                userId: user.id,
                action: "ai_query",
                resourceType: "conversation",
                resourceId: activeConversationId,
                metadata: { messageLength: message.length, tokensUsed: aiResponse.tokensUsed },
            });
        } catch (auditError) {
            console.warn("[AI Chat] Audit log failed:", auditError);
        }

        return NextResponse.json({
            response: aiResponse.response,
            conversationId: activeConversationId,
            knowledgeFreshness,
            usage: {
                used: usageLimit.used + 1,
                limit: usageLimit.limit,
                remaining: usageLimit.remaining - 1,
            },
        });
    } catch (error) {
        console.error("[AI Chat Error]", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}

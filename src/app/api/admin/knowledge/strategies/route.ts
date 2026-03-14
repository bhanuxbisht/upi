import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/admin-auth";
import { publishOutboxEvent } from "@/lib/events/outbox";
import { z } from "zod";

const strategySchema = z
    .object({
        id: z.string().trim().min(1, "id is required").max(120),
        title: z.string().trim().min(1, "title is required").max(200),
        category: z.string().trim().min(1, "category is required").max(120),
        difficulty: z.enum(["easy", "medium", "advanced"]),
        monthly_savings_min: z.number().min(0).max(1_000_000).optional(),
        monthly_savings_max: z.number().min(0).max(1_000_000).optional(),
        steps: z.array(z.string().trim().min(1).max(400)).min(1, "at least one step is required").max(100).optional(),
        requirements: z.array(z.string().trim().min(1).max(300)).max(100).optional(),
        warnings: z.array(z.string().trim().min(1).max(300)).max(100).optional(),
        applicable_to: z.array(z.string().trim().min(1).max(120)).max(100).optional(),
        is_active: z.boolean().optional(),
        confidence_level: z.enum(["verified", "community", "unverified"]).optional(),
        source_url: z.string().url().nullable().optional(),
        last_verified_date: z.string().datetime().optional(),
    })
    .superRefine((input, ctx) => {
        const min = input.monthly_savings_min ?? 0;
        const max = input.monthly_savings_max ?? 0;

        if (max < min) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "monthly_savings_max must be greater than or equal to monthly_savings_min",
                path: ["monthly_savings_max"],
            });
        }
    });

function revalidateKnowledgePaths() {
    revalidatePath("/admin");
    revalidatePath("/ask");
}

/** GET — List all strategies */
export async function GET() {
    try {
        const auth = await verifyAdmin();
        if ("error" in auth) return auth.error;
        const { supabase } = auth;

        const { data, error } = await supabase
            .from("knowledge_strategies")
            .select("*")
            .order("category", { ascending: true })
            .order("title", { ascending: true });

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data });
    } catch {
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

/** POST — Create or update a strategy */
export async function POST(request: NextRequest) {
    try {
        const auth = await verifyAdmin();
        if ("error" in auth) return auth.error;
        const { supabase, user } = auth;

        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: "Invalid JSON body" },
                { status: 400 }
            );
        }

        const parsed = strategySchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0]?.message ?? "Validation failed" },
                { status: 400 }
            );
        }

        const data = parsed.data;

        const { data: existingRecord } = await supabase
            .from("knowledge_strategies")
            .select("last_verified_date")
            .eq("id", data.id)
            .maybeSingle();

        const resolvedLastVerifiedDate =
            data.last_verified_date ?? existingRecord?.last_verified_date ?? new Date().toISOString();

        const record = {
            id: data.id,
            title: data.title,
            category: data.category,
            difficulty: data.difficulty,
            monthly_savings_min: data.monthly_savings_min ?? 0,
            monthly_savings_max: data.monthly_savings_max ?? 0,
            steps: data.steps || [],
            requirements: data.requirements || [],
            warnings: data.warnings || [],
            applicable_to: data.applicable_to || [],
            is_active: data.is_active ?? true,
            confidence_level: data.confidence_level || "verified",
            source_url: data.source_url ?? null,
            last_verified_date: resolvedLastVerifiedDate,
            verified_by: user.email || "admin",
        };

        const { data: upsertedStrategy, error } = await supabase
            .from("knowledge_strategies")
            .upsert(record, { onConflict: "id" })
            .select("id, title, updated_at, is_active, confidence_level, last_verified_date")
            .single();

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        revalidateKnowledgePaths();

        try {
            await publishOutboxEvent(
                {
                    eventType: "knowledge.strategy.upserted",
                    aggregateType: "knowledge_strategies",
                    aggregateId: upsertedStrategy.id,
                    userId: user.id,
                    idempotencyKey: `knowledge-strategy:${upsertedStrategy.id}:upsert:${upsertedStrategy.updated_at}`,
                    payload: {
                        title: upsertedStrategy.title,
                        is_active: upsertedStrategy.is_active,
                        confidence_level: upsertedStrategy.confidence_level,
                        last_verified_date: upsertedStrategy.last_verified_date,
                    },
                },
                { supabase }
            );
        } catch (eventError) {
            console.warn("[Admin Knowledge Strategies] Failed to enqueue event:", eventError);
        }

        return NextResponse.json({ success: true, data: upsertedStrategy }, { status: 201 });
    } catch {
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

/** DELETE — Delete a strategy by ID */
export async function DELETE(request: NextRequest) {
    try {
        const auth = await verifyAdmin();
        if ("error" in auth) return auth.error;
        const { supabase, user } = auth;

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Missing id parameter" },
                { status: 400 }
            );
        }

        const { data: deletedStrategy, error } = await supabase
            .from("knowledge_strategies")
            .delete()
            .eq("id", id)
            .select("id, title")
            .maybeSingle();

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        if (!deletedStrategy) {
            return NextResponse.json(
                { success: false, error: "Strategy not found" },
                { status: 404 }
            );
        }

        revalidateKnowledgePaths();

        try {
            await publishOutboxEvent(
                {
                    eventType: "knowledge.strategy.deleted",
                    aggregateType: "knowledge_strategies",
                    aggregateId: deletedStrategy.id,
                    userId: user.id,
                    idempotencyKey: `knowledge-strategy:${deletedStrategy.id}:deleted:${Date.now()}`,
                    payload: {
                        title: deletedStrategy.title,
                        deleted_at: new Date().toISOString(),
                    },
                },
                { supabase }
            );
        } catch (eventError) {
            console.warn("[Admin Knowledge Strategies] Failed to enqueue delete event:", eventError);
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type OutboxEventType =
    | "transaction.created"
    | "offer.created"
    | "offer.updated"
    | "offer.deleted"
    | string;

interface PublishOutboxEventInput {
    eventType: OutboxEventType;
    aggregateType: string;
    aggregateId: string;
    idempotencyKey: string;
    userId?: string | null;
    payload?: Record<string, unknown>;
    maxAttempts?: number;
}

interface PublishOutboxEventOptions {
    supabase?: SupabaseClient;
}

export interface PublishOutboxEventResult {
    queued: boolean;
    duplicate: boolean;
    eventId?: string;
}

/**
 * Adds an event to the outbox table for async processing.
 * Duplicate idempotency keys are treated as success to support safe retries.
 */
export async function publishOutboxEvent(
    input: PublishOutboxEventInput,
    options: PublishOutboxEventOptions = {}
): Promise<PublishOutboxEventResult> {
    const supabase = options.supabase ?? await getSupabaseServerClient();

    const { data, error } = await supabase
        .from("event_outbox")
        .insert({
            event_type: input.eventType,
            aggregate_type: input.aggregateType,
            aggregate_id: input.aggregateId,
            user_id: input.userId ?? null,
            idempotency_key: input.idempotencyKey,
            payload: input.payload ?? {},
            max_attempts: input.maxAttempts ?? 5,
        })
        .select("id")
        .single();

    if (error) {
        if (error.code === "23505") {
            return { queued: false, duplicate: true };
        }

        throw new Error(`Failed to enqueue outbox event: ${error.message}`);
    }

    return {
        queued: true,
        duplicate: false,
        eventId: data.id,
    };
}

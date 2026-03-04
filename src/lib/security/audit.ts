/**
 * Audit Logging — Security compliance utility
 * Logs every sensitive data access for DPDP Act compliance
 * 
 * Audit logging is fire-and-forget. If the audit_logs table 
 * doesn't exist yet, it silently fails without breaking the app.
 */

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AuditAction =
    | "view_transactions"
    | "export_data"
    | "delete_account"
    | "ai_query"
    | "update_profile"
    | "view_offers"
    | "track_saving"
    | "admin_access"
    | "login"
    | "logout"
    | "consent_granted"
    | "consent_revoked";

export type ResourceType =
    | "transaction"
    | "profile"
    | "offer"
    | "conversation"
    | "savings"
    | "consent"
    | "account";

interface AuditLogEntry {
    userId: string | null;
    action: AuditAction;
    resourceType: ResourceType;
    resourceId?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Log an audit event — fire and forget (non-blocking)
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
    try {
        const supabase = await getSupabaseServerClient();

        // We don't use headers() here to avoid issues when called outside request context
        await supabase.from("audit_logs").insert({
            user_id: entry.userId,
            action: entry.action,
            resource_type: entry.resourceType,
            resource_id: entry.resourceId || null,
            ip_address: null,
            user_agent: null,
            metadata: entry.metadata || {},
        });
    } catch {
        // Audit logging should NEVER break the main flow
        // Table might not exist yet, Supabase might be down, etc.
    }
}

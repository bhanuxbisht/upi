/**
 * Simple in-memory rate limiter for API routes.
 *
 * How it works:
 *   - Tracks request timestamps per key (user ID or IP)
 *   - Rejects requests that exceed the limit within the window
 *   - Automatically cleans up old entries to prevent memory leaks
 *
 * Limitation:
 *   - In-memory only — resets on server restart
 *   - Won't work across multiple server instances (use Redis for that)
 *   - Fine for MVP / single-instance deployments (Vercel serverless has
 *     short-lived instances anyway, so abuse is naturally limited)
 *
 * Usage:
 *   const limiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });
 *   const result = limiter.check(userId);
 *   if (!result.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 */

interface RateLimiterOptions {
    /** Max number of requests allowed within the time window */
    maxRequests: number;
    /** Time window in milliseconds */
    windowMs: number;
}

interface RateLimitResult {
    allowed: boolean;
    /** How many requests remain in current window */
    remaining: number;
    /** When the current window resets (Unix ms) */
    resetAt: number;
    /** How many seconds until they can retry (only set when blocked) */
    retryAfterSeconds?: number;
}

interface RateLimitEntry {
    timestamps: number[];
    lastCleanup: number;
}

export function createRateLimiter({ maxRequests, windowMs }: RateLimiterOptions) {
    const store = new Map<string, RateLimitEntry>();

    // Periodically clean up stale entries to prevent memory leaks
    // Run cleanup every 5 minutes
    const CLEANUP_INTERVAL = 5 * 60 * 1000;
    let lastGlobalCleanup = Date.now();

    function globalCleanup() {
        const now = Date.now();
        if (now - lastGlobalCleanup < CLEANUP_INTERVAL) return;
        lastGlobalCleanup = now;

        for (const [key, entry] of store.entries()) {
            // Remove entries with no recent activity
            if (entry.timestamps.length === 0 || now - entry.timestamps[entry.timestamps.length - 1] > windowMs * 2) {
                store.delete(key);
            }
        }
    }

    function check(key: string): RateLimitResult {
        const now = Date.now();
        const windowStart = now - windowMs;

        globalCleanup();

        let entry = store.get(key);
        if (!entry) {
            entry = { timestamps: [], lastCleanup: now };
            store.set(key, entry);
        }

        // Remove timestamps outside the current window
        entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

        if (entry.timestamps.length >= maxRequests) {
            // Rate limited
            const oldestInWindow = entry.timestamps[0];
            const resetAt = oldestInWindow + windowMs;
            const retryAfterSeconds = Math.ceil((resetAt - now) / 1000);

            return {
                allowed: false,
                remaining: 0,
                resetAt,
                retryAfterSeconds: Math.max(1, retryAfterSeconds),
            };
        }

        // Allow the request
        entry.timestamps.push(now);

        return {
            allowed: true,
            remaining: maxRequests - entry.timestamps.length,
            resetAt: now + windowMs,
        };
    }

    return { check };
}

// ============================================================
// Pre-configured limiters for different API routes
// ============================================================

/** Savings tracking: max 20 requests per 1 minute per user */
export const savingsTrackLimiter = createRateLimiter({
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
});

/** Savings stats: max 30 requests per 1 minute per user */
export const savingsStatsLimiter = createRateLimiter({
    maxRequests: 30,
    windowMs: 60 * 1000,
});

/** General API: max 60 requests per 1 minute per user/IP */
export const generalApiLimiter = createRateLimiter({
    maxRequests: 60,
    windowMs: 60 * 1000,
});

/** Auth-sensitive endpoints: max 5 requests per 1 minute per IP */
export const authLimiter = createRateLimiter({
    maxRequests: 5,
    windowMs: 60 * 1000,
});

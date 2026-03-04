/**
 * Transaction Service — CRUD + Analytics for user transactions
 */

import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface TransactionInput {
    merchant_name: string;
    category: string;
    amount: number;
    payment_app: string;
    payment_method?: string;
    card_used?: string;
    cashback_received?: number;
    offer_used_id?: string;
    notes?: string;
    transaction_date?: string;
}

export interface TransactionFilters {
    category?: string;
    payment_app?: string;
    from_date?: string;
    to_date?: string;
    page?: number;
    limit?: number;
}

export interface SpendingAnalytics {
    totalSpent: number;
    totalCashback: number;
    totalMissedSavings: number;
    transactionCount: number;
    categoryBreakdown: Array<{
        category: string;
        amount: number;
        count: number;
        cashback: number;
    }>;
    appUsage: Array<{
        app: string;
        count: number;
        amount: number;
        percentage: number;
    }>;
    monthlyTrend: Array<{
        month: string;
        spent: number;
        cashback: number;
    }>;
}

/**
 * Log a new transaction
 */
export async function createTransaction(
    userId: string,
    input: TransactionInput
) {
    const supabase = await getSupabaseServerClient();

    const { data, error } = await supabase
        .from("user_transactions")
        .insert({
            user_id: userId,
            merchant_name: input.merchant_name,
            category: input.category,
            amount: input.amount,
            payment_app: input.payment_app,
            payment_method: input.payment_method || null,
            card_used: input.card_used || null,
            cashback_received: input.cashback_received || 0,
            offer_used_id: input.offer_used_id || null,
            notes: input.notes || null,
            transaction_date: input.transaction_date || new Date().toISOString(),
        })
        .select()
        .single();

    if (error) throw new Error(`Failed to create transaction: ${error.message}`);
    return data;
}

/**
 * Get user's transactions with filters
 */
export async function getTransactions(
    userId: string,
    filters: TransactionFilters = {}
) {
    const supabase = await getSupabaseServerClient();
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const offset = (page - 1) * limit;

    let query = supabase
        .from("user_transactions")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("transaction_date", { ascending: false })
        .range(offset, offset + limit - 1);

    if (filters.category) {
        query = query.eq("category", filters.category);
    }
    if (filters.payment_app) {
        query = query.eq("payment_app", filters.payment_app);
    }
    if (filters.from_date) {
        query = query.gte("transaction_date", filters.from_date);
    }
    if (filters.to_date) {
        query = query.lte("transaction_date", filters.to_date);
    }

    const { data, error, count } = await query;

    if (error) throw new Error(`Failed to fetch transactions: ${error.message}`);

    return {
        items: data || [],
        total: count || 0,
        page,
        limit,
        has_more: (count || 0) > offset + limit,
    };
}

/**
 * Get spending analytics for a user
 */
export async function getSpendingAnalytics(
    userId: string,
    months: number = 3
): Promise<SpendingAnalytics> {
    const supabase = await getSupabaseServerClient();

    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - months);

    const { data: transactions, error } = await supabase
        .from("user_transactions")
        .select("*")
        .eq("user_id", userId)
        .gte("transaction_date", fromDate.toISOString())
        .order("transaction_date", { ascending: false });

    if (error) throw new Error(`Failed to fetch analytics: ${error.message}`);

    const txns = transactions || [];

    // Calculate totals
    const totalSpent = txns.reduce((s, t) => s + Number(t.amount), 0);
    const totalCashback = txns.reduce(
        (s, t) => s + Number(t.cashback_received || 0),
        0
    );
    const totalMissedSavings = txns.reduce(
        (s, t) => s + Number(t.could_have_saved || 0),
        0
    );

    // Category breakdown
    const categoryMap = new Map<
        string,
        { amount: number; count: number; cashback: number }
    >();
    for (const t of txns) {
        const key = t.category;
        const existing = categoryMap.get(key) || {
            amount: 0,
            count: 0,
            cashback: 0,
        };
        categoryMap.set(key, {
            amount: existing.amount + Number(t.amount),
            count: existing.count + 1,
            cashback: existing.cashback + Number(t.cashback_received || 0),
        });
    }

    const categoryBreakdown = Array.from(categoryMap.entries())
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.amount - a.amount);

    // App usage
    const appMap = new Map<string, { count: number; amount: number }>();
    for (const t of txns) {
        const existing = appMap.get(t.payment_app) || { count: 0, amount: 0 };
        appMap.set(t.payment_app, {
            count: existing.count + 1,
            amount: existing.amount + Number(t.amount),
        });
    }

    const appUsage = Array.from(appMap.entries())
        .map(([app, data]) => ({
            app,
            ...data,
            percentage:
                txns.length > 0 ? Math.round((data.count / txns.length) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);

    // Monthly trend
    const monthMap = new Map<string, { spent: number; cashback: number }>();
    for (const t of txns) {
        const month = new Date(t.transaction_date).toISOString().slice(0, 7); // YYYY-MM
        const existing = monthMap.get(month) || { spent: 0, cashback: 0 };
        monthMap.set(month, {
            spent: existing.spent + Number(t.amount),
            cashback: existing.cashback + Number(t.cashback_received || 0),
        });
    }

    const monthlyTrend = Array.from(monthMap.entries())
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month));

    return {
        totalSpent,
        totalCashback,
        totalMissedSavings,
        transactionCount: txns.length,
        categoryBreakdown,
        appUsage,
        monthlyTrend,
    };
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(userId: string, transactionId: string) {
    const supabase = await getSupabaseServerClient();

    const { error } = await supabase
        .from("user_transactions")
        .delete()
        .eq("id", transactionId)
        .eq("user_id", userId);

    if (error) throw new Error(`Failed to delete transaction: ${error.message}`);
}

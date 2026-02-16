import { z } from "zod";

/** "Best Way to Pay" query input */
export const recommendSchema = z.object({
  merchant: z
    .string()
    .min(1, "Merchant name is required")
    .max(100, "Merchant name too long"),
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(10_000_000, "Amount too large"),
});

export type RecommendInput = z.infer<typeof recommendSchema>;

/** Offer submission form */
export const offerSubmissionSchema = z.object({
  merchant_name: z
    .string()
    .min(1, "Merchant name is required")
    .max(100),
  payment_app_name: z
    .string()
    .min(1, "Payment app is required")
    .max(100),
  offer_title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200),
  offer_description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000),
  cashback_amount: z
    .number()
    .positive()
    .nullable()
    .optional(),
  cashback_percent: z
    .number()
    .positive()
    .max(100)
    .nullable()
    .optional(),
  max_cashback: z
    .number()
    .positive()
    .nullable()
    .optional(),
  min_transaction: z
    .number()
    .positive()
    .nullable()
    .optional(),
  promo_code: z.string().max(50).nullable().optional(),
  valid_to: z.string().nullable().optional(),
  source_url: z.string().url("Invalid URL").nullable().optional(),
});

export type OfferSubmissionInput = z.infer<typeof offerSubmissionSchema>;

/** Waitlist signup */
export const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  name: z.string().min(1, "Name is required").max(100),
  apps_used: z.array(z.string()).min(1, "Select at least one app"),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;

/** Offer filter query params */
export const offerFilterSchema = z.object({
  merchant: z.string().optional(),
  category: z.string().optional(),
  payment_app: z.string().optional(),
  type: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(50).default(20),
});

export type OfferFilterInput = z.infer<typeof offerFilterSchema>;

/** Admin — create offer directly */
export const adminOfferSchema = z.object({
  merchant_id: z.string().uuid("Select a merchant"),
  payment_app_id: z.string().uuid("Select a payment app"),
  type: z.enum(["cashback", "discount", "reward_points", "coupon", "bogo"]),
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000),
  cashback_amount: z.number().positive().nullable().optional(),
  cashback_percent: z.number().positive().max(100).nullable().optional(),
  max_cashback: z.number().positive().nullable().optional(),
  min_transaction: z.number().positive().nullable().optional(),
  promo_code: z.string().max(50).nullable().optional(),
  valid_from: z.string().optional(),
  valid_to: z.string().min(1, "Expiry date is required"),
  terms: z.string().max(2000).nullable().optional(),
  source_url: z.string().url("Invalid URL").or(z.literal("")).nullable().optional(),
  status: z.enum(["active", "pending"]),
});

export type AdminOfferInput = z.infer<typeof adminOfferSchema>;


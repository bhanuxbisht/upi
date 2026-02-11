/** Core database types — mirrors Supabase schema */

export type OfferStatus = "active" | "expired" | "pending" | "rejected";
export type OfferType = "cashback" | "discount" | "reward_points" | "coupon" | "bogo";
export type PaymentMethodType = "upi" | "credit_card" | "debit_card" | "wallet" | "bnpl";
export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface Merchant {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  logo_url: string | null;
  website_url: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  created_at: string;
}

export interface PaymentApp {
  id: string;
  name: string;
  slug: string;
  type: PaymentMethodType;
  logo_url: string | null;
  color: string;
  created_at: string;
}

export interface Offer {
  id: string;
  merchant_id: string;
  payment_app_id: string;
  type: OfferType;
  title: string;
  description: string;
  cashback_amount: number | null;
  cashback_percent: number | null;
  max_cashback: number | null;
  min_transaction: number | null;
  promo_code: string | null;
  valid_from: string;
  valid_to: string;
  terms: string | null;
  source_url: string | null;
  status: OfferStatus;
  verified_count: number;
  downvote_count: number;
  created_at: string;
  updated_at: string;
}

export interface OfferWithRelations extends Offer {
  merchant: Merchant;
  payment_app: PaymentApp;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface UserPaymentMethod {
  id: string;
  user_id: string;
  payment_app_id: string;
  card_name: string | null;
  card_bank: string | null;
  created_at: string;
}

export interface OfferSubmission {
  id: string;
  user_id: string;
  merchant_name: string;
  payment_app_name: string;
  offer_title: string;
  offer_description: string;
  cashback_amount: number | null;
  cashback_percent: number | null;
  max_cashback: number | null;
  min_transaction: number | null;
  promo_code: string | null;
  valid_to: string | null;
  source_url: string | null;
  status: SubmissionStatus;
  created_at: string;
}

export interface OfferVerification {
  id: string;
  offer_id: string;
  user_id: string;
  is_valid: boolean;
  created_at: string;
}

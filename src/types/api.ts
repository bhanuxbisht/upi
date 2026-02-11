/** Consistent API response format */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/** "Best Way to Pay" recommendation result */
export interface PaymentRecommendation {
  offer_id: string;
  app_name: string;
  app_slug: string;
  offer_title: string;
  estimated_savings: number;
  savings_display: string;
  detail: string;
  promo_code: string | null;
  valid_to: string | null;
}

/** Search/filter params for offers */
export interface OfferFilters {
  merchant?: string;
  category?: string;
  payment_app?: string;
  type?: string;
  min_amount?: number;
  search?: string;
  page?: number;
  limit?: number;
}

/** Paginated response */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

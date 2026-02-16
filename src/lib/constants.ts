/** App-wide constants */

export const APP_NAME = "PayWise";
export const APP_TAGLINE = "Never overpay on a digital payment again";
export const APP_DESCRIPTION =
  "PayWise recommends the best UPI app, credit card, or wallet for every transaction — so you always get maximum cashback and rewards.";

export const ITEMS_PER_PAGE = 20;

/**
 * Admin whitelist — only these emails can access /admin.
 * Add your Supabase Auth email here.
 * Example: ["bhanu@yourdomain.com"]
 */
export const ADMIN_EMAILS: string[] = [
  "yogendrabisht0617@gmail.com",
];

export const CATEGORIES = [
  { name: "Food Delivery", slug: "food-delivery", icon: "🍕" },
  { name: "Groceries", slug: "groceries", icon: "🛒" },
  { name: "Shopping", slug: "shopping", icon: "🛍️" },
  { name: "Bills & Recharges", slug: "bills-recharges", icon: "⚡" },
  { name: "Travel", slug: "travel", icon: "✈️" },
  { name: "Entertainment", slug: "entertainment", icon: "🎬" },
  { name: "Health & Pharmacy", slug: "health-pharmacy", icon: "💊" },
  { name: "Fuel", slug: "fuel", icon: "⛽" },
  { name: "Education", slug: "education", icon: "📚" },
  { name: "Other", slug: "other", icon: "💳" },
] as const;

export const PAYMENT_APPS = [
  { name: "PhonePe", slug: "phonepe", color: "#5F259F" },
  { name: "Google Pay", slug: "google-pay", color: "#4285F4" },
  { name: "Paytm", slug: "paytm", color: "#00BAF2" },
  { name: "Amazon Pay", slug: "amazon-pay", color: "#FF9900" },
  { name: "CRED", slug: "cred", color: "#1A1A2E" },
  { name: "WhatsApp Pay", slug: "whatsapp-pay", color: "#25D366" },
  { name: "BHIM", slug: "bhim", color: "#00796B" },
  { name: "Freecharge", slug: "freecharge", color: "#7B2D8E" },
  { name: "Mobikwik", slug: "mobikwik", color: "#2196F3" },
] as const;

export const NAV_LINKS = [
  { label: "Offers", href: "/offers" },
  { label: "Best Way to Pay", href: "/recommend" },
  { label: "My Savings", href: "/savings" },
  { label: "Submit Offer", href: "/submit" },
] as const;

export const FOOTER_LINKS = {
  product: [
    { label: "Offers", href: "/offers" },
    { label: "Best Way to Pay", href: "/recommend" },
    { label: "Submit Offer", href: "/submit" },
    { label: "Chrome Extension", href: "/extension" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
} as const;

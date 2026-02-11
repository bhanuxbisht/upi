import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Copy } from "lucide-react";

interface OfferCardProps {
  offer: {
    id: string;
    title: string;
    description: string;
    merchant: { name: string; slug: string };
    payment_app: { name: string; color: string };
    type: string;
    cashback_amount: number | null;
    cashback_percent: number | null;
    max_cashback: number | null;
    min_transaction: number | null;
    promo_code: string | null;
    valid_to: string;
    verified_count: number;
    category: string;
  };
}

export function OfferCard({ offer }: OfferCardProps) {
  const savingsDisplay = offer.cashback_amount
    ? `₹${offer.cashback_amount} cashback`
    : offer.cashback_percent
      ? `${offer.cashback_percent}% back`
      : "Special offer";

  const daysLeft = Math.ceil(
    (new Date(offer.valid_to).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Left: Info */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className="text-white text-xs"
                style={{ backgroundColor: offer.payment_app.color }}
              >
                {offer.payment_app.name}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {offer.category}
              </Badge>
              {offer.verified_count >= 10 && (
                <Badge variant="outline" className="gap-1 text-xs text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified ({offer.verified_count})
                </Badge>
              )}
            </div>

            <h3 className="text-base font-semibold">{offer.title}</h3>
            <p className="text-sm text-muted-foreground">{offer.description}</p>

            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {offer.min_transaction && (
                <span>Min: ₹{offer.min_transaction}</span>
              )}
              {offer.max_cashback && (
                <span>Max: ₹{offer.max_cashback}</span>
              )}
              <span>
                {daysLeft > 0 ? `${daysLeft} days left` : "Expiring today"}
              </span>
            </div>

            {offer.promo_code && (
              <div className="inline-flex items-center gap-2 rounded-md border border-dashed border-emerald-300 bg-emerald-50 px-3 py-1.5">
                <code className="text-sm font-semibold text-emerald-700">
                  {offer.promo_code}
                </code>
                <Copy className="h-3.5 w-3.5 cursor-pointer text-emerald-600" />
              </div>
            )}
          </div>

          {/* Right: Savings badge */}
          <div className="flex flex-col items-center rounded-lg bg-emerald-50 px-4 py-3 text-center sm:min-w-[120px]">
            <span className="text-xs text-muted-foreground">You save</span>
            <span className="text-lg font-bold text-emerald-700">
              {savingsDisplay}
            </span>
            <span className="text-xs text-muted-foreground">
              at {offer.merchant.name}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

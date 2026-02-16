import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Copy } from "lucide-react";
import type { OfferWithRelations } from "@/types";
import { TrackSavingButton } from "@/components/savings/track-saving-button";

interface OfferCardProps {
  offer: OfferWithRelations;
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
    <Card className="group overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:border-emerald-200 hover:bg-emerald-50/10 hover:shadow-lg dark:hover:border-emerald-900/50 dark:hover:bg-emerald-900/10">
      <CardContent className="p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          {/* Left: Info */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className="border-0 text-white px-2.5 py-0.5 text-xs font-semibold shadow-sm"
                style={{ backgroundColor: offer.payment_app.color }}
              >
                {offer.payment_app.name}
              </Badge>
              <Badge variant="secondary" className="bg-muted/50 text-xs font-medium text-muted-foreground">
                {offer.type}
              </Badge>
              {offer.verified_count >= 10 && (
                <Badge variant="outline" className="gap-1 border-emerald-200 bg-emerald-50 text-xs text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified ({offer.verified_count})
                </Badge>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                {offer.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {offer.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground/80">
              {offer.min_transaction && (
                <span className="flex items-center gap-1">
                  Min Spend: <span className="text-foreground">₹{offer.min_transaction}</span>
                </span>
              )}
              {offer.max_cashback && (
                <span className="flex items-center gap-1">
                  Max Cap: <span className="text-foreground">₹{offer.max_cashback}</span>
                </span>
              )}
              <span className={daysLeft <= 3 ? "text-amber-600 dark:text-amber-400" : ""}>
                {daysLeft > 0 ? `Ends in ${daysLeft} days` : "Expiring today"}
              </span>
            </div>

            {offer.promo_code && (
              <div className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/50 px-3 py-1.5 transition-colors hover:bg-emerald-100/50 dark:border-emerald-800 dark:bg-emerald-900/20">
                <code className="text-sm font-bold tracking-wide text-emerald-700 dark:text-emerald-400">
                  {offer.promo_code}
                </code>
                <Copy className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
            )}
          </div>

          {/* Right: Savings Box */}
          <div className="flex shrink-0 flex-col items-end gap-2 sm:items-center">
            <div className="flex min-w-[140px] flex-col items-center justify-center rounded-xl bg-emerald-50 px-4 py-3 text-center dark:bg-emerald-900/10">
              <span className="text-xs font-medium text-emerald-600/80 dark:text-emerald-400/80">
                Estimated Savings
              </span>
              <span className="text-xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">
                {savingsDisplay}
              </span>
            </div>
            {/* Merchant Name */}
            <span className="text-xs font-medium text-muted-foreground/60">
              at {offer.merchant.name}
            </span>
            {/* Track Saving Button */}
            <TrackSavingButton
              offerId={offer.id}
              merchantName={offer.merchant.name}
              paymentAppName={offer.payment_app.name}
              category={offer.merchant.slug}
              estimatedSaving={offer.cashback_amount ?? undefined}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

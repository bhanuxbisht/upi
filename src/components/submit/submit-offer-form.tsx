"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { offerSubmissionSchema, type OfferSubmissionInput } from "@/lib/validations";
import { PAYMENT_APPS } from "@/lib/constants";
import { Send } from "lucide-react";

export function SubmitOfferForm() {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OfferSubmissionInput>({
    resolver: zodResolver(offerSubmissionSchema),
  });

  async function onSubmit(data: OfferSubmissionInput) {
    // TODO: Send to Supabase once connected
    // For now, show success toast
    toast.success("Offer submitted!", {
      description:
        "Thanks for contributing! Our team will review and publish it shortly.",
    });
    reset();
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Merchant */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Merchant / Store *
            </label>
            <Input
              {...register("merchant_name")}
              placeholder="e.g. Swiggy, Zomato, Amazon..."
            />
            {errors.merchant_name && (
              <p className="mt-1 text-sm text-red-500">{errors.merchant_name.message}</p>
            )}
          </div>

          {/* Payment App */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Payment App *
            </label>
            <Select
              onValueChange={(val) => setValue("payment_app_name", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment app" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_APPS.map((app) => (
                  <SelectItem key={app.slug} value={app.name}>
                    {app.name}
                  </SelectItem>
                ))}
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.payment_app_name && (
              <p className="mt-1 text-sm text-red-500">{errors.payment_app_name.message}</p>
            )}
          </div>

          {/* Offer Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Offer Title *
            </label>
            <Input
              {...register("offer_title")}
              placeholder="e.g. Flat ₹75 cashback on Swiggy orders"
            />
            {errors.offer_title && (
              <p className="mt-1 text-sm text-red-500">{errors.offer_title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Description *
            </label>
            <Textarea
              {...register("offer_description")}
              placeholder="Describe the offer in detail — terms, conditions, how to avail..."
              rows={3}
            />
            {errors.offer_description && (
              <p className="mt-1 text-sm text-red-500">{errors.offer_description.message}</p>
            )}
          </div>

          {/* Cashback row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Cashback Amount (₹)
              </label>
              <Input
                {...register("cashback_amount", { valueAsNumber: true })}
                type="number"
                placeholder="e.g. 75"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Cashback Percent (%)
              </label>
              <Input
                {...register("cashback_percent", { valueAsNumber: true })}
                type="number"
                placeholder="e.g. 10"
              />
            </div>
          </div>

          {/* Limits row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Max Cashback (₹)
              </label>
              <Input
                {...register("max_cashback", { valueAsNumber: true })}
                type="number"
                placeholder="e.g. 200"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Min Transaction (₹)
              </label>
              <Input
                {...register("min_transaction", { valueAsNumber: true })}
                type="number"
                placeholder="e.g. 199"
              />
            </div>
          </div>

          {/* Promo code + Valid to */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Promo Code
              </label>
              <Input
                {...register("promo_code")}
                placeholder="e.g. SAVE50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Valid Until
              </label>
              <Input
                {...register("valid_to")}
                type="date"
              />
            </div>
          </div>

          {/* Source URL */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Source URL (optional)
            </label>
            <Input
              {...register("source_url")}
              type="url"
              placeholder="Link to the offer page"
            />
            {errors.source_url && (
              <p className="mt-1 text-sm text-red-500">{errors.source_url.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            <Send className="mr-2 h-4 w-4" />
            Submit Offer
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Submitted offers are reviewed by our team before going live.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

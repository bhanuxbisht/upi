import { APP_NAME } from "@/lib/constants";
import type { Metadata } from "next";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: `Contact — ${APP_NAME}`,
  description: `Get in touch with the ${APP_NAME} team for feedback, partnerships, or support.`,
};

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
      <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
        <p>
          Have feedback, a partnership inquiry, or found a bug? We&apos;d love to hear from you.
        </p>
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <Mail className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="text-sm font-medium text-foreground">Email</p>
            <a
              href="mailto:support@paywise.in"
              className="text-sm text-emerald-600 hover:underline"
            >
              support@paywise.in
            </a>
          </div>
        </div>
        <p className="text-sm text-muted-foreground/70">
          We typically respond within 24–48 hours.
        </p>
      </div>
    </div>
  );
}

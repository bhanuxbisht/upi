import { APP_NAME } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Blog — ${APP_NAME}`,
  description: `Tips, guides, and updates from the ${APP_NAME} team on maximizing your digital payment savings.`,
};

export default function BlogPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
      <div className="mt-8 rounded-xl border border-dashed border-muted-foreground/20 p-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">Coming Soon</p>
        <p className="mt-2 text-sm text-muted-foreground/70">
          We&apos;re working on guides, saving tips, and payment app comparisons.
          Check back soon!
        </p>
      </div>
    </div>
  );
}

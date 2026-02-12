import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ExtensionPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="rounded-full bg-emerald-100 p-4 dark:bg-emerald-900/20">
        <span className="text-4xl">🧩</span>
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Chrome Extension Coming Soon
      </h1>
      <p className="mt-4 max-w-lg text-lg text-muted-foreground">
        We're building a powerful browser extension to help you save money on every payment, automatically.
      </p>
      <div className="mt-10 flex gap-4">
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Button disabled>Add to Chrome (Soon)</Button>
      </div>
    </div>
  );
}

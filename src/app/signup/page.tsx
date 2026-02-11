import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign Up — PayWise",
  description: "Create your PayWise account. Find the best UPI cashback offers and never miss a deal.",
};

export default function SignupPage() {
  return (
    <section className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 text-muted-foreground">
            Join thousands of smart spenders saving on every UPI payment.
          </p>
        </div>
        <SignupForm />
      </div>
    </section>
  );
}

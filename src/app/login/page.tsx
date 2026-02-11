import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Log In — PayWise",
  description: "Log in to PayWise to save your payment preferences and get personalised recommendations.",
};

export default function LoginPage() {
  return (
    <section className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">
            Log in to access your saved offers and payment preferences.
          </p>
        </div>
        <LoginForm />
      </div>
    </section>
  );
}

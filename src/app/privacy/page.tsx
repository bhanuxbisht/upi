import { APP_NAME } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Privacy Policy — ${APP_NAME}`,
  description: `How ${APP_NAME} collects, uses, and protects your personal data.`,
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>

      <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
          <p>
            We collect the minimum data required to provide our service: your email address
            (for authentication), payment app preferences, and savings tracking data you
            voluntarily submit. We do not access your bank accounts, UPI PINs, or transaction
            history from any payment app.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Data</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Deliver personalized payment recommendations</li>
            <li>Track your savings progress (only data you submit)</li>
            <li>Improve offer relevance and app experience</li>
            <li>Send occasional product updates (opt-out available)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. Data Sharing</h2>
          <p>
            We do not sell your personal data. We may share anonymized, aggregated analytics
            with advertising partners. Sponsored offers displayed on our platform are clearly
            labeled.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Cookies &amp; Analytics</h2>
          <p>
            We use essential cookies for authentication and optional analytics cookies
            (Google Analytics) to understand usage patterns. You can disable non-essential
            cookies in your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Data Security</h2>
          <p>
            All data is transmitted over HTTPS. Authentication is handled by Supabase with
            industry-standard security practices. We apply row-level security to all database
            tables.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Your Rights</h2>
          <p>
            You can request deletion of your account and all associated data at any time
            by contacting us at{" "}
            <a href="mailto:support@paywise.in" className="text-emerald-600 hover:underline">
              support@paywise.in
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Contact</h2>
          <p>
            For privacy-related questions, email{" "}
            <a href="mailto:support@paywise.in" className="text-emerald-600 hover:underline">
              support@paywise.in
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}

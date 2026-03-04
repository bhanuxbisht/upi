import { APP_NAME } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Terms of Service — ${APP_NAME}`,
  description: `Terms and conditions for using ${APP_NAME}.`,
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>

      <div className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or using {APP_NAME}, you agree to be bound by these Terms of Service.
            If you do not agree, please discontinue using the platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Service Description</h2>
          <p>
            {APP_NAME} is an information aggregation platform that compiles cashback offers,
            discounts, and payment optimization recommendations from various UPI and digital
            payment apps in India. We do not process payments directly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. Offer Accuracy</h2>
          <p>
            While we strive to keep all offer information current and accurate, offers are
            subject to change by the respective payment apps and merchants without notice.
            {APP_NAME} is not responsible for expired, modified, or inaccurate offers.
            Always verify terms on the official payment app before completing a transaction.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. User Submissions</h2>
          <p>
            When you submit an offer, you represent that the information is accurate to the
            best of your knowledge. We reserve the right to review, edit, or reject any
            submission. Submitted offers become part of our public database.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Advertising</h2>
          <p>
            {APP_NAME} displays advertisements including Google AdSense ads and sponsored
            offer placements. Sponsored content is clearly labeled. Clicking on ads may
            redirect you to third-party websites governed by their own terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Limitation of Liability</h2>
          <p>
            {APP_NAME} is provided &quot;as is&quot; without warranties of any kind. We are not
            liable for any financial loss resulting from reliance on our recommendations
            or offer information. Maximum liability is limited to the amount you have paid
            us (which for free users is ₹0).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Account Termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms,
            submit fraudulent offers, or engage in abusive behavior.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">8. Governing Law</h2>
          <p>
            These terms are governed by the laws of India. Any disputes shall be subject
            to the exclusive jurisdiction of courts in New Delhi, India.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">9. Contact</h2>
          <p>
            Questions about these terms? Email{" "}
            <a href="mailto:support@paywise.in" className="text-emerald-600 hover:underline">
              support@paywise.in
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}

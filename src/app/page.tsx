import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  IndianRupee,
  Users,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_NAME, PAYMENT_APPS, CATEGORIES } from "@/lib/constants";

const STATS = [
  { label: "UPI Transactions Daily", value: "640M+", icon: Zap },
  { label: "Avg. Missed Savings/Year", value: "₹2,000+", icon: IndianRupee },
  { label: "Payment Apps Tracked", value: "9+", icon: CreditCard },
  { label: "Active Users", value: "Growing", icon: Users },
];

const FEATURES = [
  {
    title: "Best Way to Pay",
    description:
      "Enter merchant & amount — get instant ranked recommendations across all UPI apps, cards, and wallets.",
    icon: Sparkles,
    href: "/recommend",
  },
  {
    title: "Live Offer Dashboard",
    description:
      "Browse 500+ cashback offers updated daily. Filter by merchant, category, or payment app.",
    icon: TrendingUp,
    href: "/offers",
  },
  {
    title: "Community Verified",
    description:
      "Every offer is verified by our community. Upvote what works, flag what doesn't.",
    icon: Shield,
    href: "/offers",
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Tell us where you're paying",
    description: "Enter the merchant name and amount",
  },
  {
    step: "2",
    title: "See the best payment option",
    description:
      "We compare offers across PhonePe, GPay, Paytm, CRED, Amazon Pay & more",
  },
  {
    step: "3",
    title: "Save money every time",
    description: "Open the recommended app and pay — savings are automatic",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-background px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
            🇮🇳 Built for India&apos;s 500M+ UPI users
          </Badge>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Never overpay on a{" "}
            <span className="text-emerald-600">digital payment</span> again
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            {APP_NAME} tells you which UPI app, credit card, or wallet gives the
            best cashback for every transaction. Compare across PhonePe, Google
            Pay, Paytm, CRED, Amazon Pay & more — in seconds.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/recommend">
              <Button
                size="lg"
                className="bg-emerald-600 px-8 hover:bg-emerald-700"
              >
                Find Best Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/offers">
              <Button size="lg" variant="outline" className="px-8">
                Browse Offers
              </Button>
            </Link>
          </div>

          {/* Payment Apps Row */}
          <div className="mt-12">
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Comparing offers across
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {PAYMENT_APPS.map((app) => (
                <div
                  key={app.slug}
                  className="flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-medium shadow-sm"
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: app.color }}
                  />
                  {app.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="mx-auto mb-2 h-6 w-6 text-emerald-600" />
              <p className="text-2xl font-bold sm:text-3xl">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Save money on every payment
            </h2>
            <p className="mt-3 text-muted-foreground">
              Three powerful tools, completely free.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Link key={feature.title} href={feature.href}>
                <Card className="group h-full transition-shadow hover:shadow-lg">
                  <CardContent className="p-6">
                    <feature.icon className="mb-4 h-10 w-10 text-emerald-600" />
                    <h3 className="text-lg font-semibold group-hover:text-emerald-600">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">
              Save money in 3 simple steps — takes less than 10 seconds.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/recommend">
              <Button
                size="lg"
                className="bg-emerald-600 px-8 hover:bg-emerald-700"
              >
                Try it now — it&apos;s free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Browse by category
            </h2>
            <p className="mt-3 text-muted-foreground">
              Find the best deals in your favourite spending categories.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/offers?category=${cat.slug}`}>
                <Card className="group cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <span className="text-3xl">{cat.icon}</span>
                    <span className="mt-2 text-sm font-medium group-hover:text-emerald-600">
                      {cat.name}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-600 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Start saving on every payment today
          </h2>
          <p className="mt-4 text-emerald-100">
            Join thousands of smart Indians who never overpay. Free forever for
            basic features.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button
                size="lg"
                variant="secondary"
                className="px-8 text-emerald-700"
              >
                Sign up free
              </Button>
            </Link>
            <Link href="/recommend">
              <Button
                size="lg"
                variant="outline"
                className="border-white px-8 text-white hover:bg-white/10"
              >
                Try without signup
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

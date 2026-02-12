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
import { PaymentLogoMarquee } from "@/components/layout/marquee";

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
      <section className="relative overflow-hidden bg-background pt-32 pb-20 sm:pt-40 sm:pb-24 lg:pb-32">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-black dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)]" />

        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <div className="mx-auto mb-8 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-emerald-100 bg-white/50 px-7 py-2 shadow-md backdrop-blur-3xl transition-all hover:border-emerald-200 hover:bg-white/80 dark:border-emerald-900/50 dark:bg-black/50">
            <Badge variant="secondary" className="rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300">New</Badge>
            <p className="text-sm font-medium text-muted-foreground">
              Built for India&apos;s 500M+ UPI users
            </p>
          </div>
          
          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
            Never overpay on a{" "}
            <span className="relative whitespace-nowrap text-emerald-600">
              <span className="relative">digital payment</span>
            </span>{" "}
            again
          </h1>
          
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            {APP_NAME} acts as your financial copilot. We analyze thousands of offers across 
            UPI apps and cards to recommend the single best way to pay, instantly.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link href="/recommend">
              <Button
                size="lg"
                className="rounded-full bg-emerald-600 px-8 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20"
              >
                Find Best Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/offers">
              <Button size="lg" variant="outline" className="rounded-full px-8 backdrop-blur-sm bg-background/50 border-emerald-100 hover:bg-emerald-50/50">
                Browse Offers
              </Button>
            </Link>
          </div>

          {/* Payment Apps Marquee */}
          <div className="mt-20">
            <PaymentLogoMarquee />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-emerald-100/50 bg-emerald-50/50 px-4 py-12 dark:border-emerald-900/50 dark:bg-emerald-950/20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="mx-auto mb-2 h-6 w-6 text-emerald-600" />
              <p className="text-2xl font-bold tracking-tight sm:text-3xl">{stat.value}</p>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Save money on every payment
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Three powerful tools, completely free.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Link key={feature.title} href={feature.href}>
                <Card className="group h-full overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:border-emerald-200 hover:shadow-lg dark:hover:border-emerald-900/50">
                  <CardContent className="flex flex-col items-center p-8 text-center">
                    <div className="mb-6 rounded-full bg-emerald-50 p-4 ring-1 ring-emerald-100 dark:bg-emerald-900/20 dark:ring-emerald-900/50">
                      <feature.icon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                      {feature.title}
                    </h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
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
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Save money in 3 simple steps — takes less than 10 seconds.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-emerald-100 dark:bg-white/10 dark:ring-white/20">
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{item.step}</span>
                </div>
                <h3 className="text-lg font-bold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link href="/recommend">
              <Button
                size="lg"
                className="rounded-full bg-emerald-600 px-8 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
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
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Browse by category
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Find the best deals in your favourite spending categories.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} href={`/offers?category=${cat.slug}`}>
                <Card className="group h-full cursor-pointer overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:border-emerald-200 hover:shadow-md dark:hover:border-emerald-900/50">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <span className="text-4xl transition-transform duration-300 group-hover:scale-110">{cat.icon}</span>
                    <span className="mt-3 text-sm font-semibold tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
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
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 px-4 py-24 text-white sm:px-6 lg:px-8">
         <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-soft-light"></div>
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Start saving on every payment today
          </h2>
          <p className="mt-4 text-emerald-100/90 text-lg">
            Join thousands of smart Indians who never overpay. Free forever for
            basic features.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full bg-white text-emerald-700 hover:bg-emerald-50 px-8"
              >
                Sign up free
              </Button>
            </Link>
            <Link href="/recommend">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-emerald-200 bg-transparent px-8 text-white hover:bg-white/10 hover:text-white hover:border-white"
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

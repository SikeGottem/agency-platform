import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ArrowRight, Sparkles } from "lucide-react";

export const metadata = {
  title: "Pricing — Briefed",
  description: "Simple, transparent pricing. Free to start, upgrade when you're ready.",
};

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "Perfect for trying Briefed with a few clients.",
    cta: "Get Started Free",
    ctaHref: "/signup",
    highlighted: false,
    features: [
      "3 projects per month",
      "Basic brief templates",
      "Email delivery",
      "Client magic links",
      "Auto-save responses",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    description: "For freelancers who want the full toolkit.",
    cta: "Start Pro Trial",
    ctaHref: "/signup?plan=pro",
    highlighted: true,
    features: [
      "Unlimited projects",
      "Custom templates",
      "PDF brief export",
      "Custom branding",
      "Priority email support",
      "Client portal access",
    ],
  },
  {
    name: "Team",
    price: "$69",
    period: "/mo",
    description: "For agencies and growing teams.",
    cta: "Start Team Trial",
    ctaHref: "/signup?plan=team",
    highlighted: false,
    features: [
      "Everything in Pro",
      "Multiple team seats",
      "Shared template library",
      "Team analytics dashboard",
      "Priority support",
      "Custom onboarding",
    ],
  },
];

const comparisonFeatures = [
  { name: "Projects per month", free: "3", pro: "Unlimited", team: "Unlimited" },
  { name: "Brief templates", free: "Basic", pro: "Custom", team: "Shared library" },
  { name: "Email delivery", free: "✓", pro: "✓", team: "✓" },
  { name: "PDF export", free: "—", pro: "✓", team: "✓" },
  { name: "Custom branding", free: "—", pro: "✓", team: "✓" },
  { name: "Team seats", free: "1", pro: "1", team: "Up to 10" },
  { name: "Analytics", free: "—", pro: "Basic", team: "Full" },
  { name: "Priority support", free: "—", pro: "—", team: "✓" },
  { name: "Client portal", free: "—", pro: "✓", team: "✓" },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <Link href="/" className="text-xl tracking-tight">
            <span className="font-display italic">Briefed</span>
            <span className="text-primary">.</span>
          </Link>
          <nav className="flex items-center gap-2 md:gap-4">
            <Link
              href="/#features"
              className="hidden md:inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="hidden md:inline-block text-sm text-foreground font-medium transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Button
              asChild
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            >
              <Link href="/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-8">
          {/* Hero */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-4 py-1.5 text-sm text-primary font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              Simple, transparent pricing
            </div>
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight leading-tight">
              Plans that grow
              <br />
              with your practice
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Free to start. Upgrade when you need more power. Cancel anytime.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-24">
            {tiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative overflow-hidden ${
                  tier.highlighted
                    ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                    : ""
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                )}
                <CardContent className="p-6 sm:p-8 flex flex-col h-full">
                  {tier.highlighted && (
                    <span className="inline-block mb-4 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded-full px-3 py-1 w-fit">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-xl font-semibold">{tier.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{tier.description}</p>

                  <ul className="mt-6 space-y-3 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={`mt-8 w-full rounded-xl ${
                      tier.highlighted
                        ? "bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/25"
                        : ""
                    }`}
                    variant={tier.highlighted ? "default" : "outline"}
                    size="lg"
                  >
                    <Link href={tier.ctaHref}>
                      {tier.cta}
                      {tier.highlighted && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl text-center mb-10">
              Compare plans
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-4 font-medium text-muted-foreground">Feature</th>
                    <th className="text-center py-3 px-4 font-semibold">Free</th>
                    <th className="text-center py-3 px-4 font-semibold text-primary">Pro</th>
                    <th className="text-center py-3 px-4 font-semibold">Team</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row) => (
                    <tr key={row.name} className="border-b border-border/50">
                      <td className="py-3 pr-4 text-muted-foreground">{row.name}</td>
                      <td className="py-3 px-4 text-center">{row.free}</td>
                      <td className="py-3 px-4 text-center font-medium">{row.pro}</td>
                      <td className="py-3 px-4 text-center">{row.team}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-sm tracking-tight">
            <span className="font-display italic">Briefed</span>
            <span className="text-primary">.</span>
          </Link>
          <span className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Briefed. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}

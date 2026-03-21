import Link from "next/link";
import {
  FileText,
  Users,
  FileSignature,
  TrendingUp,
  Receipt,
  BarChart3,
  Zap,
  Check,
  ArrowRight,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const features = [
  {
    icon: FileText,
    title: "Invoice Builder",
    description:
      "Create professional invoices in seconds with our drag-and-drop builder. Add line items, taxes, discounts, and send directly to clients.",
  },
  {
    icon: Users,
    title: "Client Management",
    description:
      "Keep all your client details in one place. Track invoices, outstanding balances, and payment history per client.",
  },
  {
    icon: FileSignature,
    title: "Contract Templates",
    description:
      "Choose from 4 pre-built contract templates. Add signers, send for e-signature, and get legally binding contracts fast.",
  },
  {
    icon: TrendingUp,
    title: "Payment Tracking",
    description:
      "Know exactly who owes you and when. Get automatic overdue alerts and track your income with ease.",
  },
  {
    icon: Receipt,
    title: "Expense Management",
    description:
      "Track business expenses by category. Upload receipts, associate with clients, and export to CSV for taxes.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Visualize your revenue trends, top clients, and business health at a glance with our revenue charts.",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    description: "For freelancers just getting started",
    features: [
      "5 invoices per month",
      "1 contract per month",
      "3 clients",
      "Basic PDF export",
      "Email support",
    ],
    cta: "Get Started Free",
    href: "/register",
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "$15",
    period: "/month",
    description: "For active freelancers",
    popular: true,
    features: [
      "50 invoices per month",
      "20 contracts per month",
      "50 clients",
      "Custom branding on PDFs",
      "Contract e-signatures",
      "Expense tracking",
      "Revenue analytics",
      "Priority support",
    ],
    cta: "Start Free Trial",
    href: "/register?plan=pro",
    variant: "default" as const,
  },
  {
    name: "Business",
    price: "$39",
    period: "/month",
    description: "Unlimited for power users",
    features: [
      "Unlimited invoices",
      "Unlimited contracts",
      "Unlimited clients",
      "White-label PDFs",
      "API access",
      "Custom domain",
      "Dedicated support",
    ],
    cta: "Start Free Trial",
    href: "/register?plan=business",
    variant: "outline" as const,
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Freelance Designer",
    content:
      "FreelancePro cut my invoicing time from 30 minutes to 5. I love how professional my invoices look now.",
    stars: 5,
  },
  {
    name: "Marcus Chen",
    role: "Web Developer",
    content:
      "The contract templates are a game changer. My clients sign electronically and I get paid faster.",
    stars: 5,
  },
  {
    name: "Priya Patel",
    role: "Marketing Consultant",
    content:
      "Finally a tool that handles invoices AND contracts. The dashboard gives me a clear picture of my business.",
    stars: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-6xl">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">FreelancePro</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto max-w-6xl px-4 text-center relative">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5">
            <Zap className="mr-1.5 h-3 w-3" />
            Trusted by 2,000+ freelancers
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-3xl mx-auto leading-tight">
            Invoice Smarter,{" "}
            <span className="text-primary">Get Paid Faster</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            The all-in-one platform for freelancers. Create professional invoices, manage
            contracts with e-signatures, track expenses, and get a clear view of your business
            — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-base px-8">
              <Link href="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8">
              <Link href="/login">See Demo</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required · 14-day free trial
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to run your freelance business
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From invoicing to contracts to expense tracking — FreelancePro has every tool
              you need in one beautiful platform.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-card rounded-xl p-6 border hover:shadow-md transition-shadow"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">Loved by freelancers</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-card rounded-xl p-6 border">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div>
                  <p className="font-medium text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Start free and upgrade when you&apos;re ready. No hidden fees.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-card rounded-xl p-6 border flex flex-col ${
                  plan.popular ? "border-primary shadow-lg relative" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="px-3 text-xs">Most Popular</Badge>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-extrabold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button asChild variant={plan.variant} className="w-full">
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="bg-primary rounded-2xl p-10 md:p-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to get paid faster?
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8 text-lg">
              Join thousands of freelancers who use FreelancePro to run their business
              professionally.
            </p>
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="text-base px-8"
            >
              <Link href="/register">
                Start for Free Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-semibold">FreelancePro</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <a href="mailto:support@freelancepro.app" className="hover:text-foreground transition-colors">
                Support
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} FreelancePro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Loader2, Check, Zap, Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  limits: {
    invoices: string;
    contracts: string;
    clients: string;
  };
  highlight?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "FREE",
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "5 invoices per month",
      "1 contract per month",
      "3 clients",
      "Basic PDF export",
      "Email support",
    ],
    limits: { invoices: "5/month", contracts: "1/month", clients: "3" },
  },
  {
    id: "PRO",
    name: "Pro",
    price: "$15",
    description: "For growing freelancers",
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
    limits: { invoices: "50/month", contracts: "20/month", clients: "50" },
    highlight: true,
  },
  {
    id: "BUSINESS",
    name: "Business",
    price: "$39",
    description: "Unlimited for power users",
    features: [
      "Unlimited invoices",
      "Unlimited contracts",
      "Unlimited clients",
      "White-label PDFs",
      "API access",
      "Custom domain",
      "Dedicated support",
      "Team members (coming soon)",
    ],
    limits: { invoices: "Unlimited", contracts: "Unlimited", clients: "Unlimited" },
  },
];

const PLAN_INVOICE_LIMITS: Record<string, number> = {
  FREE: 5,
  PRO: 50,
  BUSINESS: Infinity,
};

interface BillingCardProps {
  plan: string;
  stripeCustomerId: string | null;
  invoicesThisMonth: number;
  currentPeriodEnd: Date | null;
}

export function BillingCard({
  plan,
  stripeCustomerId,
  invoicesThisMonth,
  currentPeriodEnd,
}: BillingCardProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const invoiceLimit = PLAN_INVOICE_LIMITS[plan] ?? 5;
  const invoiceUsagePercent =
    invoiceLimit === Infinity ? 0 : Math.min((invoicesThisMonth / invoiceLimit) * 100, 100);

  const handleUpgrade = async (planId: string) => {
    setIsLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      if (!res.ok) throw new Error("Failed to create checkout session");
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Failed to initiate checkout. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading("manage");
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Failed to open billing portal. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your active subscription</CardDescription>
            </div>
            <Badge
              variant={plan === "FREE" ? "secondary" : "default"}
              className="text-sm px-3 py-1"
            >
              {plan}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentPeriodEnd && (
            <p className="text-sm text-muted-foreground">
              Renews on {formatDate(currentPeriodEnd)}
            </p>
          )}

          {/* Usage */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Invoices this month</span>
                <span className="font-medium">
                  {invoicesThisMonth} / {invoiceLimit === Infinity ? "∞" : invoiceLimit}
                </span>
              </div>
              {invoiceLimit !== Infinity && (
                <Progress value={invoiceUsagePercent} className="h-2" />
              )}
            </div>
          </div>

          {stripeCustomerId && plan !== "FREE" && (
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={isLoading === "manage"}
            >
              {isLoading === "manage" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Manage Subscription
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div>
        <h3 className="font-semibold mb-4">Available Plans</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => {
            const isCurrentPlan = plan === p.id;
            const PlanIcon =
              p.id === "FREE" ? Zap : p.id === "PRO" ? Sparkles : Building2;

            return (
              <Card
                key={p.id}
                className={`relative ${
                  p.highlight
                    ? "border-primary shadow-md"
                    : ""
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="px-3">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <PlanIcon className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">{p.name}</CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{p.price}</span>
                    {p.price !== "$0" && (
                      <span className="text-muted-foreground text-sm">/month</span>
                    )}
                  </div>
                  <CardDescription>{p.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {p.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Separator />
                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : p.id === "FREE" ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleManageSubscription}
                      disabled={!!isLoading}
                    >
                      Downgrade
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={p.highlight ? "default" : "outline"}
                      onClick={() => handleUpgrade(p.id)}
                      disabled={!!isLoading}
                    >
                      {isLoading === p.id && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Upgrade to {p.name}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

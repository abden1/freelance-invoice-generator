"use client";

import * as React from "react";
import { Sparkles, Zap, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UpgradePromptProps {
  plan: "PRO" | "BUSINESS";
  feature: string;
  onUpgrade: () => void;
  className?: string;
  inline?: boolean;
}

const PLAN_CONFIG = {
  PRO: {
    label: "Pro",
    description: "Unlock advanced features and take your workflow to the next level.",
    icon: Zap,
    badgeClass: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-transparent",
    buttonClass: "bg-violet-600 hover:bg-violet-700 text-white",
    gradient: "from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20",
    borderClass: "border-violet-200 dark:border-violet-800",
  },
  BUSINESS: {
    label: "Business",
    description: "Scale your business with unlimited access and priority support.",
    icon: Sparkles,
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-transparent",
    buttonClass: "bg-amber-600 hover:bg-amber-700 text-white",
    gradient: "from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20",
    borderClass: "border-amber-200 dark:border-amber-800",
  },
} as const;

export function UpgradePrompt({
  plan,
  feature,
  onUpgrade,
  className,
  inline = false,
}: UpgradePromptProps) {
  const config = PLAN_CONFIG[plan];
  const PlanIcon = config.icon;

  if (inline) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border px-4 py-3",
          `bg-gradient-to-r ${config.gradient}`,
          config.borderClass,
          className
        )}
      >
        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="flex-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{feature}</span> is
          available on the{" "}
          <span className="font-semibold">{config.label}</span> plan.
        </p>
        <Button
          size="sm"
          onClick={onUpgrade}
          className={cn(config.buttonClass)}
        >
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        `bg-gradient-to-br ${config.gradient}`,
        config.borderClass,
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-sm dark:bg-white/10">
            <PlanIcon className="h-5 w-5 text-foreground" />
          </div>
          <Badge className={cn(config.badgeClass)}>{config.label} Plan</Badge>
        </div>
        <CardTitle className="text-xl">Unlock {feature}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {plan === "PRO" && (
            <>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-600 dark:bg-violet-400" />
                </span>
                Unlimited invoices and contracts
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-600 dark:bg-violet-400" />
                </span>
                Custom branding and logo
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-600 dark:bg-violet-400" />
                </span>
                Advanced analytics and reports
              </li>
            </>
          )}
          {plan === "BUSINESS" && (
            <>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
                </span>
                Everything in Pro
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
                </span>
                Team collaboration and multi-user
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
                </span>
                Priority support and SLA guarantee
              </li>
            </>
          )}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className={cn("w-full", config.buttonClass)}
          onClick={onUpgrade}
        >
          Upgrade to {config.label}
        </Button>
      </CardFooter>
    </Card>
  );
}

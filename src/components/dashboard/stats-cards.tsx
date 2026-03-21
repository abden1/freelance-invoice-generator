"use client";

import { DollarSign, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StatsData {
  totalInvoiced?: number;
  totalPaid?: number;
  totalPending?: number;
  totalOverdue?: number;
  invoicedChange?: number;
  paidChange?: number;
  pendingChange?: number;
  overdueChange?: number;
}

interface StatsCardsProps {
  data?: StatsData | null;
}

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

function StatCard({ title, value, change, icon: Icon, iconColor, iconBg }: StatCardProps) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={cn("text-xs mt-1", isPositive ? "text-green-600" : "text-red-600")}>
            {isPositive ? "+" : ""}
            {change.toFixed(1)}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function StatsCards({ data }: StatsCardsProps) {
  const stats = data ?? {};

  const cards: StatCardProps[] = [
    {
      title: "Total Invoiced",
      value: formatCurrency(stats.totalInvoiced ?? 0),
      change: stats.invoicedChange,
      icon: DollarSign,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Total Paid",
      value: formatCurrency(stats.totalPaid ?? 0),
      change: stats.paidChange,
      icon: TrendingUp,
      iconColor: "text-green-600",
      iconBg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Pending",
      value: formatCurrency(stats.totalPending ?? 0),
      change: stats.pendingChange,
      icon: Clock,
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    {
      title: "Overdue",
      value: formatCurrency(stats.totalOverdue ?? 0),
      change: stats.overdueChange,
      icon: AlertCircle,
      iconColor: "text-red-600",
      iconBg: "bg-red-100 dark:bg-red-900/30",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}

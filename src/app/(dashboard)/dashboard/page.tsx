import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { UpcomingDueDates } from "@/components/dashboard/upcoming-due-dates";
import { Skeleton } from "@/components/ui/skeleton";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

async function getAnalytics(userId: string) {
  try {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);

    const [allInvoices, thisMonthInvoices, recentActivity] = await Promise.all([
      prisma.invoice.findMany({
        where: { userId, status: { not: "CANCELLED" } },
        select: { total: true, status: true, paidAmount: true },
      }),
      prisma.invoice.findMany({
        where: {
          userId,
          createdAt: { gte: thisMonthStart, lte: thisMonthEnd },
          status: { not: "CANCELLED" },
        },
        select: { total: true, status: true },
      }),
      prisma.invoice.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          number: true,
          status: true,
          total: true,
          currency: true,
          createdAt: true,
          client: { select: { name: true } },
        },
      }),
    ]);

    const stats = {
      totalInvoiced: allInvoices.reduce((s, i) => s + Number(i.total), 0),
      totalPaid: allInvoices
        .filter((i) => i.status === "PAID")
        .reduce((s, i) => s + Number(i.total), 0),
      totalPending: allInvoices
        .filter((i) => i.status === "SENT")
        .reduce((s, i) => s + Number(i.total), 0),
      totalOverdue: allInvoices
        .filter((i) => i.status === "OVERDUE")
        .reduce((s, i) => s + Number(i.total), 0),
      thisMonthInvoiced: thisMonthInvoices.reduce((s, i) => s + Number(i.total), 0),
    };

    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthInvoices = await prisma.invoice.findMany({
        where: {
          userId,
          createdAt: { gte: monthStart, lte: monthEnd },
          status: { not: "CANCELLED" },
        },
        select: { total: true, status: true },
      });

      revenueByMonth.push({
        month: format(monthDate, "MMM yyyy"),
        revenue: monthInvoices
          .filter((inv) => inv.status === "PAID")
          .reduce((s, inv) => s + Number(inv.total), 0),
        invoiced: monthInvoices.reduce((s, inv) => s + Number(inv.total), 0),
      });
    }

    return { stats, revenueByMonth, recentActivity };
  } catch {
    return null;
  }
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-xl" />
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return <Skeleton className="h-80 rounded-xl" />;
}

function TableSkeleton() {
  return <Skeleton className="h-64 rounded-xl" />;
}

export default async function DashboardPage() {
  const session = await auth();
  const analytics = session?.user?.id ? await getAnalytics(session.user.id) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your business performance.
        </p>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsCards data={analytics?.stats} />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <Suspense fallback={<ChartSkeleton />}>
            <RevenueChart data={analytics?.revenueByMonth} />
          </Suspense>
        </div>
        <div className="col-span-3">
          <Suspense fallback={<TableSkeleton />}>
            <UpcomingDueDates />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <RecentActivity />
      </Suspense>
    </div>
  );
}

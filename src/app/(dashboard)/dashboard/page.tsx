import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { UpcomingDueDates } from "@/components/dashboard/upcoming-due-dates";
import { Skeleton } from "@/components/ui/skeleton";

async function getAnalytics() {
  try {
    const session = await auth();
    if (!session?.user) return null;

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/analytics`, {
      headers: {
        Cookie: ``,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return res.json();
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
  const analytics = await getAnalytics();

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

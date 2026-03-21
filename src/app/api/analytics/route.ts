import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, startOfYear, format } from "date-fns";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const now = new Date();

  // Stats for this month
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

  // Revenue by month (last 6 months)
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

  // Status breakdown
  const statusBreakdown = allInvoices.reduce(
    (acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Top clients
  const invoicesByClient = await prisma.invoice.groupBy({
    by: ["clientId"],
    where: { userId, status: { not: "CANCELLED" } },
    _sum: { total: true },
    _count: { id: true },
    orderBy: { _sum: { total: "desc" } },
    take: 5,
  });

  const topClients = await Promise.all(
    invoicesByClient.map(async (item) => {
      const client = await prisma.client.findUnique({
        where: { id: item.clientId },
        select: { name: true },
      });
      return {
        clientId: item.clientId,
        clientName: client?.name || "Unknown",
        total: Number(item._sum.total || 0),
        invoiceCount: item._count.id,
      };
    })
  );

  // Upcoming due dates (next 30 days)
  const upcomingDue = await prisma.invoice.findMany({
    where: {
      userId,
      status: { in: ["SENT", "OVERDUE"] },
      dueDate: {
        gte: now,
        lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
    },
    select: {
      id: true,
      number: true,
      total: true,
      currency: true,
      dueDate: true,
      client: { select: { name: true } },
    },
    orderBy: { dueDate: "asc" },
    take: 5,
  });

  return NextResponse.json({
    stats,
    revenueByMonth,
    statusBreakdown,
    topClients,
    upcomingDue,
    recentActivity,
  });
}

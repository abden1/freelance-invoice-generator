import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/notifications — list notifications, auto-create overdue ones
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  // Auto-create overdue notifications for any overdue invoices not yet notified
  const overdueInvoices = await prisma.invoice.findMany({
    where: { userId, status: "OVERDUE" },
    include: { client: { select: { name: true } } },
  });

  for (const invoice of overdueInvoices) {
    const existing = await prisma.notification.findFirst({
      where: { userId, type: "INVOICE_OVERDUE", link: `/invoices/${invoice.id}` },
    });
    if (!existing) {
      await prisma.notification.create({
        data: {
          userId,
          type: "INVOICE_OVERDUE",
          title: `Invoice #${invoice.number} is overdue`,
          message: `Payment from ${invoice.client.name} is past due`,
          link: `/invoices/${invoice.id}`,
        },
      });
    }
  }

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return NextResponse.json({ notifications, unreadCount });
}

// PATCH /api/notifications — mark all as read
export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  return NextResponse.json({ success: true });
}

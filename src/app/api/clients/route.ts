import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const clients = await prisma.client.findMany({
    where: {
      userId: session.user.id,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { company: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { invoices: true, contracts: true } },
      invoices: {
        where: { status: { not: "CANCELLED" } },
        select: { total: true, status: true },
      },
    },
  });

  const clientsWithStats = clients.map(({ invoices, ...client }) => ({
    ...client,
    outstanding: invoices
      .filter((i) => i.status === "SENT" || i.status === "OVERDUE")
      .reduce((s, i) => s + Number(i.total), 0),
    totalPaid: invoices
      .filter((i) => i.status === "PAID")
      .reduce((s, i) => s + Number(i.total), 0),
  }));

  return NextResponse.json({ clients: clientsWithStats });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = clientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  return NextResponse.json({ client }, { status: 201 });
}

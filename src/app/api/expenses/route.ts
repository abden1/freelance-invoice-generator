import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { expenseSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const clientId = searchParams.get("clientId");

  const expenses = await prisma.expense.findMany({
    where: {
      userId: session.user.id,
      ...(category ? { category } : {}),
      ...(clientId ? { clientId } : {}),
    },
    include: {
      client: { select: { id: true, name: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ expenses });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = expenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { date, ...rest } = parsed.data;
  const expense = await prisma.expense.create({
    data: {
      ...rest,
      userId: session.user.id,
      date: new Date(date),
      clientId: rest.clientId || null,
    },
    include: { client: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ expense }, { status: 201 });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invoiceSchema } from "@/lib/validations";
import { canCreateInvoice } from "@/lib/subscription";
import { calculateInvoiceTotals, generateInvoiceNumber } from "@/lib/utils";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const clientId = searchParams.get("clientId");
  const search = searchParams.get("search") || "";

  const invoices = await prisma.invoice.findMany({
    where: {
      userId: session.user.id,
      ...(status ? { status: status as never } : {}),
      ...(clientId ? { clientId } : {}),
      ...(search
        ? {
            OR: [
              { number: { contains: search, mode: "insensitive" } },
              { client: { name: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      client: { select: { id: true, name: true, email: true, company: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ invoices });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = await canCreateInvoice(session.user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: "Monthly invoice limit reached. Upgrade to Pro for unlimited invoices." },
      { status: 403 }
    );
  }

  const raw = await req.json();

  // Normalize field names: accept both old and new naming conventions
  const body = {
    ...raw,
    // Accept invoiceNumber OR number
    number: raw.number ?? raw.invoiceNumber,
    // Accept issuedAt OR issueDate
    issueDate: raw.issueDate ?? raw.issuedAt,
    // Compute missing amount on each item
    items: Array.isArray(raw.items)
      ? raw.items.map((item: Record<string, number | string>) => ({
          ...item,
          amount:
            item.amount !== undefined
              ? item.amount
              : Number(item.quantity ?? 0) * Number(item.rate ?? 0),
        }))
      : raw.items,
  };

  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { items, taxRate, discountType, discountValue, status, ...rest } = parsed.data;

  const totals = calculateInvoiceTotals(
    items,
    taxRate,
    discountType,
    discountValue
  );

  // Auto-increment invoice number if not provided custom
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { invoicePrefix: true, nextInvoiceNumber: true },
  });

  let invoiceNumber = rest.number;
  if (!invoiceNumber) {
    invoiceNumber = generateInvoiceNumber(
      user?.invoicePrefix || "INV",
      user?.nextInvoiceNumber || 1
    );
  }

  const [invoice] = await prisma.$transaction([
    prisma.invoice.create({
      data: {
        ...rest,
        number: invoiceNumber,
        userId: session.user.id,
        items: items as never,
        taxRate,
        discountType: discountType || null,
        discountValue,
        status: status || "DRAFT",
        ...totals,
        issueDate: new Date(rest.issueDate),
        dueDate: new Date(rest.dueDate),
      },
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { nextInvoiceNumber: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ invoice }, { status: 201 });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invoiceSchema } from "@/lib/validations";
import { calculateInvoiceTotals } from "@/lib/utils";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: session.user.id },
    include: { client: true },
  });

  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  return NextResponse.json({ invoice });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  if (body.status !== undefined && Object.keys(body).length <= 3) {
    const invoice = await prisma.invoice.updateMany({
      where: { id, userId: session.user.id },
      data: {
        status: body.status,
        ...(body.paidDate ? { paidDate: new Date(body.paidDate) } : {}),
        ...(body.paidAmount !== undefined ? { paidAmount: body.paidAmount } : {}),
      },
    });
    if (invoice.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  }

  const parsed = invoiceSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const { items, taxRate, discountType, discountValue, ...rest } = parsed.data;

  let totals = {};
  if (items && taxRate !== undefined) {
    totals = calculateInvoiceTotals(items, taxRate ?? 0, discountType ?? null, discountValue ?? 0);
  }

  await prisma.invoice.updateMany({
    where: { id, userId: session.user.id },
    data: {
      ...rest,
      ...(items ? { items: items as never } : {}),
      ...(taxRate !== undefined ? { taxRate } : {}),
      ...(discountType !== undefined ? { discountType: discountType || null } : {}),
      ...(discountValue !== undefined ? { discountValue } : {}),
      ...totals,
      ...(rest.issueDate ? { issueDate: new Date(rest.issueDate) } : {}),
      ...(rest.dueDate ? { dueDate: new Date(rest.dueDate) } : {}),
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await prisma.invoice.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}

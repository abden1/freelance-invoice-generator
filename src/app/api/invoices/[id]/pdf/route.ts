export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInvoicePDF } from "@/lib/pdf";
import type { InvoiceItem } from "@/types";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: session.user.id },
    include: {
      client: true,
      user: true,
    },
  });

  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const pdfBuffer = await generateInvoicePDF({
    number: invoice.number,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    currency: invoice.currency,
    status: invoice.status,
    items: invoice.items as unknown as InvoiceItem[],
    subtotal: Number(invoice.subtotal),
    taxRate: Number(invoice.taxRate),
    taxAmount: Number(invoice.taxAmount),
    discountType: invoice.discountType,
    discountValue: Number(invoice.discountValue),
    discountAmount: Number(invoice.discountAmount),
    total: Number(invoice.total),
    notes: invoice.notes,
    paymentTerms: invoice.paymentTerms,
    user: {
      name: invoice.user.name,
      companyName: invoice.user.companyName,
      companyAddress: invoice.user.companyAddress,
      companyCity: invoice.user.companyCity,
      companyCountry: invoice.user.companyCountry,
      email: invoice.user.email,
      taxId: invoice.user.taxId,
      vatNumber: invoice.user.vatNumber,
      brandColor: invoice.user.brandColor,
    },
    client: {
      name: invoice.client.name,
      company: invoice.client.company,
      email: invoice.client.email,
      address: invoice.client.address,
      city: invoice.client.city,
      country: invoice.client.country,
    },
  });

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${invoice.number}.pdf"`,
    },
  });
}

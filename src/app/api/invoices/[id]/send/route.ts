import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInvoiceEmail } from "@/lib/resend";
import { generateInvoicePDF } from "@/lib/invoice-pdf";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { InvoiceItem } from "@/types";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: session.user.id },
    include: { client: true, user: true },
  });

  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  try {
    // Generate PDF
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

    await sendInvoiceEmail({
      to: invoice.client.email,
      clientName: invoice.client.name,
      invoiceNumber: invoice.number,
      amount: formatCurrency(Number(invoice.total), invoice.currency),
      dueDate: formatDate(invoice.dueDate),
      paymentUrl: invoice.stripePaymentUrl || undefined,
      pdfBuffer,
      fromName: invoice.user.companyName || invoice.user.name || "FLtool",
    });

    // Update status to SENT
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: invoice.status === "DRAFT" ? "SENT" : invoice.status,
        sentAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send invoice error:", error);
    return NextResponse.json({ error: "Failed to send invoice" }, { status: 500 });
  }
}

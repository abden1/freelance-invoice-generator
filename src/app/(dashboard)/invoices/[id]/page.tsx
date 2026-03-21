import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { InvoiceStatusBadge } from "@/components/invoice/invoice-status-badge";
import { InvoiceActions } from "@/components/invoice/invoice-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) notFound();

  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: session.user.id },
    include: {
      client: true,
    },
  });

  if (!invoice) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">{invoice.number}</h2>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <p className="text-muted-foreground text-sm">
              Issued {formatDate(invoice.issueDate)} · Due {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>
        <InvoiceActions invoice={{
          id: invoice.id,
          status: invoice.status,
          invoiceNumber: invoice.number,
        }} />
      </div>

      {/* Invoice Card */}
      <Card>
        <CardContent className="p-8 space-y-8">
          {/* Invoice Header */}
          <div className="flex justify-between">
            <div>
              <p className="text-3xl font-bold text-muted-foreground/30 tracking-widest">
                INVOICE
              </p>
              <p className="font-semibold text-lg mt-1">{invoice.number}</p>
            </div>
            <div className="text-right text-sm space-y-1">
              <p className="text-muted-foreground">Issue Date</p>
              <p className="font-medium">{formatDate(invoice.issueDate)}</p>
              <p className="text-muted-foreground mt-2">Due Date</p>
              <p className="font-medium">{formatDate(invoice.dueDate)}</p>
            </div>
          </div>

          {/* Billing Info */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Bill To
              </p>
              <p className="font-semibold">{invoice.client.name}</p>
              {invoice.client.company && (
                <p className="text-muted-foreground text-sm">{invoice.client.company}</p>
              )}
              <p className="text-muted-foreground text-sm">{invoice.client.email}</p>
              {invoice.client.address && (
                <p className="text-muted-foreground text-sm">{invoice.client.address}</p>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 text-muted-foreground font-medium">Description</th>
                  <th className="text-center py-3 text-muted-foreground font-medium w-20">Qty</th>
                  <th className="text-right py-3 text-muted-foreground font-medium w-28">Rate</th>
                  <th className="text-right py-3 text-muted-foreground font-medium w-28">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items as unknown as { id: string; description: string; quantity: number; rate: number; amount: number }[]).map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-3">{item.description}</td>
                    <td className="py-3 text-center text-muted-foreground">{Number(item.quantity)}</td>
                    <td className="py-3 text-right text-muted-foreground">
                      {formatCurrency(Number(item.rate), invoice.currency)}
                    </td>
                    <td className="py-3 text-right font-medium">
                      {formatCurrency(Number(item.amount), invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(Number(invoice.subtotal), invoice.currency)}</span>
              </div>
              {Number(invoice.taxAmount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({Number(invoice.taxRate)}%)</span>
                  <span>{formatCurrency(Number(invoice.taxAmount), invoice.currency)}</span>
                </div>
              )}
              {Number(invoice.discountAmount) > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(Number(invoice.discountAmount), invoice.currency)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total Due</span>
                <span>{formatCurrency(Number(invoice.total), invoice.currency)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="border-t pt-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Notes
              </p>
              <p className="text-sm text-muted-foreground">{invoice.notes}</p>
            </div>
          )}

          {/* Payment Terms */}
          {invoice.paymentTerms && (
            <div className="border-t pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Payment Terms
              </p>
              <p className="text-sm text-muted-foreground">{invoice.paymentTerms}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

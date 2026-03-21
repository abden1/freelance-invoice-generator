import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { InvoiceStatusBadge } from "@/components/invoice/invoice-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Mail, Phone, Building2, MapPin, Plus } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) notFound();

  const client = await prisma.client.findFirst({
    where: { id, userId: session.user.id },
    include: {
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!client) notFound();

  const totalPaid = client.invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + Number(i.total), 0);

  const totalOutstanding = client.invoices
    .filter((i) => ["SENT", "OVERDUE", "PARTIAL"].includes(i.status))
    .reduce((sum, i) => sum + Number(i.total), 0);

  const currency = client.currency ?? "USD";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{client.name}</h2>
              {client.company && (
                <p className="text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {client.company}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/clients/${id}/edit`}>Edit</Link>
          </Button>
          <Button asChild>
            <Link href={`/invoices/new?clientId=${id}`}>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Client Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Contact Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${client.email}`}
                  className="text-primary hover:underline"
                >
                  {client.email}
                </a>
              </div>
              {client.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.phone}</span>
                </div>
              )}
              {(client.address || client.city || client.country) && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    {client.address && <p>{client.address}</p>}
                    {client.city && <p>{client.city}</p>}
                    {client.country && <p>{client.country}</p>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Invoiced</p>
                <p className="text-xl font-bold">
                  {formatCurrency(
                    client.invoices.reduce((s, i) => s + Number(i.total), 0),
                    currency
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Paid</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(totalPaid, currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Outstanding</p>
                <p className="text-xl font-bold text-orange-600">
                  {formatCurrency(totalOutstanding, currency)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Invoices</p>
                <p className="text-xl font-bold">{client.invoices.length}</p>
              </div>
            </CardContent>
          </Card>

          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Invoice History */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
            </CardHeader>
            <CardContent>
              {client.invoices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">No invoices yet</p>
                  <Button asChild className="mt-3" size="sm">
                    <Link href={`/invoices/new?clientId=${id}`}>Create Invoice</Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {client.invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="text-primary hover:underline font-medium"
                          >
                            {invoice.number}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(Number(invoice.total), invoice.currency)}
                        </TableCell>
                        <TableCell>
                          <InvoiceStatusBadge status={invoice.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(invoice.dueDate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

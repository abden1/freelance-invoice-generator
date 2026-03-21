"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { differenceInDays, parseISO } from "date-fns";
import { CalendarClock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface UpcomingInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  total: number;
  currency: string;
  dueDate: string;
  status: string;
}

function DaysBadge({ days }: { days: number }) {
  if (days < 0) {
    return (
      <Badge variant="destructive" className="text-xs whitespace-nowrap">
        <AlertTriangle className="mr-1 h-3 w-3" />
        {Math.abs(days)}d overdue
      </Badge>
    );
  }
  if (days === 0) {
    return (
      <Badge variant="destructive" className="text-xs">
        Due today
      </Badge>
    );
  }
  if (days <= 3) {
    return (
      <Badge className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 whitespace-nowrap">
        {days}d left
      </Badge>
    );
  }
  if (days <= 7) {
    return (
      <Badge className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 whitespace-nowrap">
        {days}d left
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-xs whitespace-nowrap">
      {days}d left
    </Badge>
  );
}

export function UpcomingDueDates() {
  const [invoices, setInvoices] = useState<UpcomingInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUpcoming() {
      try {
        const res = await fetch("/api/invoices?status=SENT,OVERDUE&limit=8&sort=dueDate&order=asc");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        const now = new Date();
        const filtered = (data.invoices ?? []).filter((inv: UpcomingInvoice) => {
          const days = differenceInDays(parseISO(inv.dueDate), now);
          return days <= 30;
        });
        setInvoices(filtered);
      } catch {
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    }
    fetchUpcoming();
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Upcoming Due Dates</CardTitle>
        </div>
        <CardDescription>Invoices due in the next 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CalendarClock className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No upcoming due dates</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => {
              const days = differenceInDays(parseISO(invoice.dueDate), new Date());
              return (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors",
                    days < 0 && "border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/30"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{invoice.clientName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {invoice.invoiceNumber} · {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
                    <span className="text-sm font-semibold">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </span>
                    <DaysBadge days={days} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

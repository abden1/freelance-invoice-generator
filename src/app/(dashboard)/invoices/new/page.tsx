"use client";

import { InvoiceBuilder } from "@/components/invoice/invoice-builder";

export default function NewInvoicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">New Invoice</h2>
        <p className="text-muted-foreground">Create a new invoice for your client</p>
      </div>
      <InvoiceBuilder />
    </div>
  );
}

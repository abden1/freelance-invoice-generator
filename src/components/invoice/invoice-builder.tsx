"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays } from "date-fns";
import {
  Loader2,
  Send,
  Save,
  Eye,
  EyeOff,
  CalendarIcon,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { LineItemsTable } from "@/components/invoice/line-items-table";
import { useInvoiceBuilder } from "@/hooks/use-invoice-builder";
import { CURRENCIES, formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";

const invoiceSchema = z.object({
  clientId: z.string().min(1, "Please select a client"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  issuedAt: z.date(),
  dueDate: z.date(),
  currency: z.string().min(1),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface Client {
  id: string;
  name: string;
  company?: string;
  email: string;
}

interface InvoiceBuilderProps {
  defaultValues?: Partial<InvoiceFormData & { id: string }>;
}

export function InvoiceBuilder({ defaultValues }: InvoiceBuilderProps) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<"draft" | "send">("draft");

  const {
    items,
    totals,
    taxRate,
    discountType,
    discountValue,
    setTaxRate,
    setDiscountType,
    setDiscountValue,
    addItem,
    removeItem,
    updateItem,
    reorderItems,
  } = useInvoiceBuilder();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      currency: "USD",
      issuedAt: new Date(),
      dueDate: addDays(new Date(), 30),
      invoiceNumber: "",
      ...defaultValues,
    },
  });

  const selectedCurrency = watch("currency");

  // Fetch clients
  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch("/api/clients");
        if (!res.ok) return;
        const data = await res.json();
        setClients(data.clients ?? []);
      } catch {
        // ignore
      }
    }
    fetchClients();
  }, []);

  // Fetch invoice number
  useEffect(() => {
    if (defaultValues?.invoiceNumber) return;
    async function fetchNextNumber() {
      try {
        const res = await fetch("/api/invoices/next-number");
        if (!res.ok) return;
        const data = await res.json();
        setValue("invoiceNumber", data.invoiceNumber);
      } catch {
        // ignore
      }
    }
    fetchNextNumber();
  }, [defaultValues?.invoiceNumber, setValue]);

  const onSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        clientId: data.clientId,
        number: data.invoiceNumber,
        issueDate: data.issuedAt.toISOString(),
        dueDate: data.dueDate.toISOString(),
        currency: data.currency,
        notes: data.notes,
        paymentTerms: data.paymentTerms,
        items: items.map((item) => ({
          ...item,
          amount: item.quantity * item.rate,
        })),
        taxRate,
        discountType,
        discountValue,
        status: submitAction === "send" ? "SENT" : "DRAFT",
      };

      const isEdit = !!defaultValues?.id;
      const url = isEdit ? `/api/invoices/${defaultValues!.id}` : "/api/invoices";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Failed to save invoice");
      }

      const result = await res.json();
      toast.success(
        submitAction === "send" ? "Invoice sent successfully!" : "Invoice saved as draft"
      );
      router.push(`/invoices/${result.invoice?.id ?? ""}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Client Selector */}
                <div className="space-y-2">
                  <Label>
                    Client <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="clientId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={errors.clientId ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select client..." />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}{c.company ? ` — ${c.company}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.clientId && (
                    <p className="text-xs text-destructive">{errors.clientId.message}</p>
                  )}
                </div>

                {/* Invoice Number */}
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    {...register("invoiceNumber")}
                    placeholder="INV-0001"
                  />
                </div>

                {/* Issue Date */}
                <div className="space-y-2">
                  <Label>Issue Date</Label>
                  <Controller
                    name="issuedAt"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            type="button"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "MMM d, yyyy") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => date && field.onChange(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            type="button"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "MMM d, yyyy") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => date && field.onChange(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Controller
                    name="currency"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.symbol} {c.code} — {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Payment Terms */}
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Input
                    id="paymentTerms"
                    {...register("paymentTerms")}
                    placeholder="Net 30, Wire transfer, etc."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <LineItemsTable
                items={items}
                currency={selectedCurrency}
                onUpdate={updateItem}
                onRemove={removeItem}
                onAdd={addItem}
                onReorder={reorderItems}
              />

              {/* Totals */}
              <div className="mt-6 flex justify-end">
                <div className="w-full max-w-sm space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(totals.subtotal, selectedCurrency)}</span>
                  </div>

                  {/* Tax */}
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Tax</span>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          value={taxRate || ""}
                          onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                          className="h-6 w-16 text-xs p-1"
                          placeholder="0"
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                    <span>{formatCurrency(totals.taxAmount, selectedCurrency)}</span>
                  </div>

                  {/* Discount */}
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Discount</span>
                      <Select
                        value={discountType ?? "none"}
                        onValueChange={(v) =>
                          setDiscountType(v === "none" ? null : (v as "PERCENT" | "FIXED"))
                        }
                      >
                        <SelectTrigger className="h-6 w-20 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="PERCENT">%</SelectItem>
                          <SelectItem value="FIXED">Fixed</SelectItem>
                        </SelectContent>
                      </Select>
                      {discountType && (
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={discountValue || ""}
                          onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                          className="h-6 w-16 text-xs p-1"
                          placeholder="0"
                        />
                      )}
                    </div>
                    <span className="text-red-600">
                      -{formatCurrency(totals.discountAmount, selectedCurrency)}
                    </span>
                  </div>

                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>{formatCurrency(totals.total, selectedCurrency)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes & Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (visible to client)</Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder="Thank you for your business! Payment is due within 30 days..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setSubmitAction("draft")}
            >
              {isSubmitting && submitAction === "draft" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save as Draft
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={() => setSubmitAction("send")}
            >
              {isSubmitting && submitAction === "send" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Save & Send
            </Button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Preview</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview((p) => !p)}
            >
              {showPreview ? (
                <EyeOff className="mr-1 h-3.5 w-3.5" />
              ) : (
                <Eye className="mr-1 h-3.5 w-3.5" />
              )}
              {showPreview ? "Hide" : "Show"}
            </Button>
          </div>

          {showPreview ? (
            <Card className="p-6 text-sm space-y-4 sticky top-20">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-xl">INVOICE</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {watch("invoiceNumber") || "INV-XXXX"}
                  </p>
                </div>
                <Badge variant="secondary">Draft</Badge>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                    Billed To
                  </p>
                  <p className="mt-1">
                    {clients.find((c) => c.id === watch("clientId"))?.name ?? "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                    Due Date
                  </p>
                  <p className="mt-1">
                    {watch("dueDate") ? format(watch("dueDate"), "MMM d, yyyy") : "—"}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="text-muted-foreground truncate flex-1 mr-2">
                      {item.description || "Item..."}
                    </span>
                    <span className="shrink-0">
                      {formatCurrency(item.quantity * item.rate, selectedCurrency)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(totals.subtotal, selectedCurrency)}</span>
                </div>
                {totals.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                    <span>{formatCurrency(totals.taxAmount, selectedCurrency)}</span>
                  </div>
                )}
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(totals.discountAmount, selectedCurrency)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-sm pt-1 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(totals.total, selectedCurrency)}</span>
                </div>
              </div>
              {watch("notes") && (
                <div className="text-xs text-muted-foreground border-t pt-3">
                  <p className="font-semibold mb-1">Notes</p>
                  <p>{watch("notes")}</p>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              <Eye className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Click &quot;Show&quot; to preview the invoice</p>
            </Card>
          )}
        </div>
      </div>
    </form>
  );
}

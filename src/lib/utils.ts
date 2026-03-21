import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | string,
  currency: string = "USD"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(date: Date | string, pattern: string = "MMM d, yyyy"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, pattern);
}

export function generateInvoiceNumber(prefix: string, nextNumber: number): string {
  return `${prefix}-${String(nextNumber).padStart(4, "0")}`;
}

export function calculateInvoiceTotals(
  items: { quantity: number; rate: number }[],
  taxRate: number,
  discountType: "PERCENT" | "FIXED" | null,
  discountValue: number
) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const discountAmount =
    discountType === "PERCENT"
      ? (subtotal * discountValue) / 100
      : discountType === "FIXED"
      ? discountValue
      : 0;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const total = taxableAmount + taxAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + "..." : str;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, "-");
}

export const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
  { code: "AED", name: "UAE Dirham", symbol: "AED" },
  { code: "SAR", name: "Saudi Riyal", symbol: "SAR" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
];

export const EXPENSE_CATEGORIES = [
  "Office Supplies",
  "Travel",
  "Equipment",
  "Software",
  "Marketing",
  "Professional Development",
  "Meals & Entertainment",
  "Utilities",
  "Insurance",
  "Legal & Accounting",
  "Other",
];

export const INVOICE_STATUSES = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED", "PARTIAL"] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const STATUS_COLORS: Record<InvoiceStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  PAID: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  OVERDUE: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  CANCELLED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  PARTIAL: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
};

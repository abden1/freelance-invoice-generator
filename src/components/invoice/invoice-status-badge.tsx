import { cn, STATUS_COLORS, type InvoiceStatus } from "@/lib/utils";

interface InvoiceStatusBadgeProps {
  status: string;
  className?: string;
}

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  const colorClass = STATUS_COLORS[status as InvoiceStatus] ?? STATUS_COLORS.DRAFT;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClass,
        className
      )}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

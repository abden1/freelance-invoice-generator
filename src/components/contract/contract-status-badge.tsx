import { cn } from "@/lib/utils";

type ContractStatus = "DRAFT" | "SENT" | "SIGNED" | "EXPIRED" | "CANCELLED";

const CONTRACT_STATUS_COLORS: Record<ContractStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  SIGNED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  EXPIRED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  CANCELLED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

interface ContractStatusBadgeProps {
  status: string;
  className?: string;
}

export function ContractStatusBadge({ status, className }: ContractStatusBadgeProps) {
  const colorClass =
    CONTRACT_STATUS_COLORS[status as ContractStatus] ?? CONTRACT_STATUS_COLORS.DRAFT;

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

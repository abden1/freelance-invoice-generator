"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Download, Send, CheckCircle, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface InvoiceActionsProps {
  invoice: {
    id: string;
    status: string;
    invoiceNumber: string;
  };
}

export function InvoiceActions({ invoice }: InvoiceActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleAction = async (action: "send" | "paid" | "pdf") => {
    setIsLoading(true);
    try {
      if (action === "pdf") {
        const res = await fetch(`/api/invoices/${invoice.id}/pdf`);
        if (!res.ok) throw new Error("Failed");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${invoice.invoiceNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      const endpoint = action === "send" ? "send" : "mark-paid";
      const res = await fetch(`/api/invoices/${invoice.id}/${endpoint}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");

      toast.success(action === "send" ? "Invoice sent!" : "Marked as paid!");
      router.refresh();
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Invoice deleted");
      router.push("/invoices");
    } catch {
      toast.error("Failed to delete invoice");
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAction("pdf")}
          disabled={isLoading}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          PDF
        </Button>

        {invoice.status === "DRAFT" && (
          <Button
            size="sm"
            onClick={() => handleAction("send")}
            disabled={isLoading}
          >
            <Send className="mr-1.5 h-3.5 w-3.5" />
            Send
          </Button>
        )}

        {(invoice.status === "SENT" || invoice.status === "OVERDUE") && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction("paid")}
            disabled={isLoading}
            className="text-green-600 border-green-300 hover:bg-green-50"
          >
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
            Mark Paid
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/invoices/${invoice.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" /> Edit Invoice
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              Invoice {invoice.invoiceNumber} will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

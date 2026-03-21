"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Trash2, MoreHorizontal, Copy } from "lucide-react";
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

interface ContractDetailActionsProps {
  contract: {
    id: string;
    title: string;
    status: string;
  };
}

export function ContractDetailActions({ contract }: ContractDetailActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSend = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/contracts/${contract.id}/send`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Contract sent to client!");
      router.refresh();
    } catch {
      toast.error("Failed to send contract");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const res = await fetch(`/api/contracts/${contract.id}/signing-link`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      await navigator.clipboard.writeText(data.url);
      toast.success("Signing link copied to clipboard!");
    } catch {
      toast.error("Failed to get signing link");
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/contracts/${contract.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Contract deleted");
      router.push("/contracts");
    } catch {
      toast.error("Failed to delete contract");
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {contract.status === "DRAFT" && (
          <Button size="sm" onClick={handleSend} disabled={isLoading}>
            <Send className="mr-1.5 h-3.5 w-3.5" />
            Send
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {contract.status !== "DRAFT" && (
              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="mr-2 h-4 w-4" /> Copy Signing Link
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Contract
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this contract?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{contract.title}&rdquo; will be permanently deleted. Signing links
              will no longer work.
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

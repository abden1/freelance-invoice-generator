"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FileSignature, Eye, Send, Trash2, MoreHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { ContractStatusBadge } from "@/components/contract/contract-status-badge";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Contract {
  id: string;
  title: string;
  clientName?: string;
  status: string;
  createdAt: string;
  signedAt?: string;
}

export function ContractList() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/contracts?${params.toString()}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setContracts(data.contracts ?? []);
    } catch {
      toast.error("Failed to load contracts");
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(fetchContracts, 300);
    return () => clearTimeout(timeout);
  }, [fetchContracts]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/contracts/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Contract deleted");
      setContracts((prev) => prev.filter((c) => c.id !== deleteId));
    } catch {
      toast.error("Failed to delete contract");
    } finally {
      setDeleteId(null);
    }
  };

  const handleSend = async (id: string) => {
    try {
      const res = await fetch(`/api/contracts/${id}/send`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Contract sent to client!");
      fetchContracts();
    } catch {
      toast.error("Failed to send contract");
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contracts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="rounded-lg border bg-card">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : contracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileSignature className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="font-medium text-muted-foreground">No contracts yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Create your first contract to get started
              </p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/contracts/new">Create Contract</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead className="hidden md:table-cell">Signed</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Link
                        href={`/contracts/${contract.id}`}
                        className="text-primary hover:underline"
                      >
                        {contract.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {contract.clientName ?? "—"}
                    </TableCell>
                    <TableCell>
                      <ContractStatusBadge status={contract.status} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {formatDate(contract.createdAt)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {contract.signedAt ? formatDate(contract.signedAt) : "—"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/contracts/${contract.id}`}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </Link>
                          </DropdownMenuItem>
                          {contract.status === "DRAFT" && (
                            <DropdownMenuItem onClick={() => handleSend(contract.id)}>
                              <Send className="mr-2 h-4 w-4" /> Send to client
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteId(contract.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete contract?</AlertDialogTitle>
            <AlertDialogDescription>
              This contract will be permanently deleted and clients will no longer be able to
              access the signing link.
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

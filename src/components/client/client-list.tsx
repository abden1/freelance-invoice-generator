"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Users, Building2, Mail, FileText, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  currency?: string;
  _count?: {
    invoices: number;
  };
  outstanding?: number;
  totalPaid?: number;
}

export function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/clients?${params.toString()}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setClients(data.clients ?? []);
    } catch {
      toast.error("Failed to load clients");
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(fetchClients, 300);
    return () => clearTimeout(timeout);
  }, [fetchClients]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Client Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-card">
          <Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="font-medium text-muted-foreground">No clients found</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {search ? "Try a different search term" : "Add your first client to get started"}
          </p>
          {!search && (
            <Button asChild className="mt-4" size="sm">
              <Link href="/clients/new">Add Client</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card
              key={client.id}
              className="hover:shadow-md transition-shadow group"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{client.name}</p>
                      {client.company && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {client.company}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    asChild
                  >
                    <Link href={`/clients/${client.id}`}>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span>{client._count?.invoices ?? 0} invoices</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Outstanding</p>
                    <p className="font-semibold text-orange-600">
                      {formatCurrency(client.outstanding ?? 0, client.currency ?? "USD")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Total Paid</p>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(client.totalPaid ?? 0, client.currency ?? "USD")}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button asChild size="sm" variant="outline" className="flex-1 h-8">
                    <Link href={`/clients/${client.id}`}>View</Link>
                  </Button>
                  <Button asChild size="sm" className="flex-1 h-8">
                    <Link href={`/invoices/new?clientId=${client.id}`}>Invoice</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import type { Invoice, Client, Contract, Expense, User, Subscription, Plan } from "@prisma/client";

export type { Plan };

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface ContractSigner {
  name: string;
  email: string;
  status: "PENDING" | "SIGNED" | "DECLINED";
  signedAt: string | null;
  signature: string | null;
}

export type InvoiceWithClient = Invoice & {
  client: Pick<Client, "id" | "name" | "email" | "company">;
};

export type ContractWithClient = Contract & {
  client: Pick<Client, "id" | "name" | "email" | "company">;
};

export type ExpenseWithClient = Expense & {
  client: Pick<Client, "id" | "name"> | null;
};

export type ClientWithCounts = Client & {
  _count: {
    invoices: number;
    contracts: number;
  };
};

export type UserWithSubscription = User & {
  subscription: Subscription | null;
};

export interface DashboardStats {
  totalInvoiced: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  currency: string;
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  invoiced: number;
}

export interface TopClient {
  clientId: string;
  clientName: string;
  total: number;
  invoiceCount: number;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Extend NextAuth session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

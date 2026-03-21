"use client";

import { useEffect, useState } from "react";

interface SubscriptionData {
  plan: "FREE" | "PRO" | "BUSINESS";
  invoicesThisMonth: number;
  contractsThisMonth: number;
  limits: {
    invoices: number;
    contracts: number;
    clients: number;
  };
}

const PLAN_LIMITS: Record<string, { invoices: number; contracts: number; clients: number }> = {
  FREE: { invoices: 5, contracts: 1, clients: 3 },
  PRO: { invoices: 50, contracts: 20, clients: 50 },
  BUSINESS: { invoices: Infinity, contracts: Infinity, clients: Infinity },
};

interface UseSubscriptionReturn {
  plan: string;
  limits: { invoices: number; contracts: number; clients: number };
  invoicesThisMonth: number;
  contractsThisMonth: number;
  canCreateInvoice: boolean;
  canCreateContract: boolean;
  isLoading: boolean;
  isProOrHigher: boolean;
  refresh: () => void;
}

export function useSubscription(): UseSubscriptionReturn {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchSettings() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();

        if (!cancelled) {
          const plan = json.subscription?.plan ?? "FREE";
          const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE;

          setData({
            plan,
            invoicesThisMonth: json.usage?.invoicesThisMonth ?? 0,
            contractsThisMonth: json.usage?.contractsThisMonth ?? 0,
            limits,
          });
        }
      } catch {
        if (!cancelled) {
          setData({
            plan: "FREE",
            invoicesThisMonth: 0,
            contractsThisMonth: 0,
            limits: PLAN_LIMITS.FREE,
          });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchSettings();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  const plan = data?.plan ?? "FREE";
  const limits = data?.limits ?? PLAN_LIMITS.FREE;
  const invoicesThisMonth = data?.invoicesThisMonth ?? 0;
  const contractsThisMonth = data?.contractsThisMonth ?? 0;

  const canCreateInvoice = invoicesThisMonth < limits.invoices;
  const canCreateContract = contractsThisMonth < limits.contracts;
  const isProOrHigher = plan === "PRO" || plan === "BUSINESS";

  return {
    plan,
    limits,
    invoicesThisMonth,
    contractsThisMonth,
    canCreateInvoice,
    canCreateContract,
    isLoading,
    isProOrHigher,
    refresh,
  };
}

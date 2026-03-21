import { Plan } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { startOfMonth } from "date-fns";

export const PLAN_LIMITS = {
  FREE: {
    invoicesPerMonth: 5,
    contractTemplates: 2,
    teamMembers: 1,
    whiteLabel: false,
    paymentGateway: false,
    apiAccess: false,
  },
  PRO: {
    invoicesPerMonth: -1,
    contractTemplates: -1,
    teamMembers: 1,
    whiteLabel: false,
    paymentGateway: true,
    apiAccess: false,
  },
  BUSINESS: {
    invoicesPerMonth: -1,
    contractTemplates: -1,
    teamMembers: 10,
    whiteLabel: true,
    paymentGateway: true,
    apiAccess: true,
  },
} as const;

export async function getUserPlan(userId: string): Promise<Plan> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true },
  });

  if (!subscription || subscription.status === "canceled") return "FREE";
  return subscription.plan;
}

export async function canCreateInvoice(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId);
  const limits = PLAN_LIMITS[plan];

  if (limits.invoicesPerMonth === -1) return true;

  const count = await prisma.invoice.count({
    where: {
      userId,
      createdAt: { gte: startOfMonth(new Date()) },
    },
  });

  return count < limits.invoicesPerMonth;
}

export async function getInvoiceUsage(userId: string): Promise<{ used: number; limit: number; plan: Plan }> {
  const plan = await getUserPlan(userId);
  const limits = PLAN_LIMITS[plan];

  const used = await prisma.invoice.count({
    where: {
      userId,
      createdAt: { gte: startOfMonth(new Date()) },
    },
  });

  return { used, limit: limits.invoicesPerMonth, plan };
}

export async function canUseFeature(
  userId: string,
  feature: keyof (typeof PLAN_LIMITS)["FREE"]
): Promise<boolean> {
  const plan = await getUserPlan(userId);
  const limits = PLAN_LIMITS[plan];
  const value = limits[feature];
  if (typeof value === "boolean") return value;
  return value === -1 || value > 0;
}

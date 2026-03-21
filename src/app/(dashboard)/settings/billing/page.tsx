import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BillingCard } from "@/components/settings/billing-card";

async function getBillingData(userId: string) {
  const [subscription, invoiceCount] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.invoice.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ]);

  return { subscription, invoiceCount };
}

export default async function BillingPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  const { subscription, invoiceCount } = userId
    ? await getBillingData(userId)
    : { subscription: null, invoiceCount: 0 };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Billing</h2>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      <BillingCard
        plan={subscription?.plan ?? "FREE"}
        stripeCustomerId={subscription?.stripeCustomerId ?? null}
        invoicesThisMonth={invoiceCount}
        currentPeriodEnd={subscription?.currentPeriodEnd ?? null}
      />
    </div>
  );
}

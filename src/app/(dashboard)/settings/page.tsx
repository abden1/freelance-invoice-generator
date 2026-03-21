import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BusinessForm } from "@/components/settings/business-form";

export default async function SettingsPage() {
  const session = await auth();

  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          companyName: true,
          companyAddress: true,
          companyCity: true,
          companyCountry: true,
          taxId: true,
          vatNumber: true,
          logoUrl: true,
          brandColor: true,
          defaultCurrency: true,
          invoicePrefix: true,
          defaultPaymentTerms: true,
          lateFeeEnabled: true,
          lateFeePercentage: true,
          emailNotifications: true,
          reminderDaysBefore: true,
        },
      })
    : null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your business profile and preferences</p>
      </div>
      <BusinessForm defaultValues={user ? {
        companyName: user.companyName ?? undefined,
        companyAddress: user.companyAddress ?? undefined,
        companyCity: user.companyCity ?? undefined,
        companyCountry: user.companyCountry ?? undefined,
        taxId: user.taxId ?? undefined,
        vatNumber: user.vatNumber ?? undefined,
        logoUrl: user.logoUrl,
        brandColor: user.brandColor ?? undefined,
        defaultCurrency: user.defaultCurrency ?? undefined,
        invoicePrefix: user.invoicePrefix ?? undefined,
        defaultPaymentTerms: user.defaultPaymentTerms ?? undefined,
        lateFeePct: user.lateFeePercentage ?? undefined,
      } : undefined} />
    </div>
  );
}

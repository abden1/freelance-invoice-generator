import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { businessSettingsSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
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
      onboardingComplete: true,
      subscription: { select: { plan: true, status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true } },
    },
  });

  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = businessSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: { id: true, companyName: true, onboardingComplete: true },
  });

  return NextResponse.json({ user });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { invoicePrefix: true, nextInvoiceNumber: true },
  });

  const invoiceNumber = generateInvoiceNumber(
    user?.invoicePrefix || "INV",
    user?.nextInvoiceNumber || 1
  );

  return NextResponse.json({ invoiceNumber });
}

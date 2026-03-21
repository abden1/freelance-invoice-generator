import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendContractEmail } from "@/lib/resend";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const contract = await prisma.contract.findFirst({
    where: { id, userId: session.user.id },
    include: { client: true },
  });

  if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  return NextResponse.json({ contract });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  if (body.action === "send") {
    const contract = await prisma.contract.findFirst({
      where: { id, userId: session.user.id },
      include: { client: true, user: true },
    });

    if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const signingUrl = `${appUrl}/sign/${contract.signingToken}`;

    await sendContractEmail({
      to: contract.client.email,
      clientName: contract.client.name,
      contractTitle: contract.title,
      signingUrl,
      fromName: contract.user.companyName || contract.user.name || "FreelancePro",
    });

    await prisma.contract.update({
      where: { id },
      data: { status: "PENDING_SIGNATURE" },
    });

    return NextResponse.json({ success: true });
  }

  await prisma.contract.updateMany({
    where: { id, userId: session.user.id },
    data: {
      ...(body.title ? { title: body.title } : {}),
      ...(body.content ? { content: body.content } : {}),
      ...(body.status ? { status: body.status } : {}),
      ...(body.signers ? { signers: body.signers } : {}),
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await prisma.contract.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}

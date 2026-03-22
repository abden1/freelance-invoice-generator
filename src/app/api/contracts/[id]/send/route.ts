import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendContractEmail } from "@/lib/resend";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const contract = await prisma.contract.findFirst({
    where: { id, userId: session.user.id },
    include: { client: true, user: true },
  });

  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const signingUrl = `${appUrl}/sign/${contract.signingToken}`;

  try {
    // Send email to each signer
    const signers = (contract.signers as { name: string; email: string }[]) || [];

    // If there's a linked client, send to them too
    if (contract.client) {
      await sendContractEmail({
        to: contract.client.email,
        clientName: contract.client.name,
        contractTitle: contract.title,
        signingUrl,
        fromName: contract.user.companyName || contract.user.name || "FLtool",
      });
    } else if (signers.length > 0) {
      // Otherwise send to first signer
      await sendContractEmail({
        to: signers[0].email,
        clientName: signers[0].name,
        contractTitle: contract.title,
        signingUrl,
        fromName: contract.user.companyName || contract.user.name || "FLtool",
      });
    }

    await prisma.contract.update({
      where: { id },
      data: { status: "PENDING_SIGNATURE" },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Send contract error:", msg);
    return NextResponse.json({ error: "Failed to send contract", detail: msg }, { status: 500 });
  }
}

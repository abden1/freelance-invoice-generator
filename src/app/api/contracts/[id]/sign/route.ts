import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ContractSigner } from "@/types";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { token, signerEmail, signature } = body;

    if (!token || !signerEmail || !signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const contract = await prisma.contract.findFirst({
      where: { id, signingToken: token },
    });

    if (!contract) {
      return NextResponse.json({ error: "Invalid signing link" }, { status: 404 });
    }

    if (contract.status === "SIGNED") {
      return NextResponse.json({ error: "Contract already signed" }, { status: 400 });
    }

    const signers = (contract.signers as unknown as ContractSigner[]) || [];
    const updatedSigners = signers.map((s: ContractSigner) =>
      s.email === signerEmail
        ? { ...s, status: "SIGNED" as const, signedAt: new Date().toISOString(), signature }
        : s
    );

    const allSigned = updatedSigners.every((s: ContractSigner) => s.status === "SIGNED");

    await prisma.contract.update({
      where: { id },
      data: {
        signers: updatedSigners as never,
        status: allSigned ? "SIGNED" : "PENDING_SIGNATURE",
        ...(allSigned ? { signedAt: new Date() } : {}),
      },
    });

    return NextResponse.json({ success: true, allSigned });
  } catch (error) {
    console.error("Sign contract error:", error);
    return NextResponse.json({ error: "Failed to sign contract" }, { status: 500 });
  }
}

// Public GET — for signing page to load contract
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(_req.url);
  const token = searchParams.get("token");

  const contract = await prisma.contract.findFirst({
    where: { id, signingToken: token || "" },
    include: {
      client: { select: { name: true, email: true } },
      user: { select: { companyName: true, name: true } },
    },
  });

  if (!contract) {
    return NextResponse.json({ error: "Invalid signing link" }, { status: 404 });
  }

  return NextResponse.json({
    contract: {
      id: contract.id,
      title: contract.title,
      content: contract.content,
      status: contract.status,
      signers: contract.signers,
      client: contract.client,
      fromName: contract.user.companyName || contract.user.name,
    },
  });
}

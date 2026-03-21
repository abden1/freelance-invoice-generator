import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ContractSigner } from "@/types";

// GET /api/contracts/sign?token=xxx — load contract for signing page (no auth required)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const contract = await prisma.contract.findFirst({
    where: { signingToken: token },
    include: {
      client: { select: { name: true, email: true } },
      user: { select: { companyName: true, name: true, email: true } },
    },
  });

  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  const signers = (contract.signers as unknown as ContractSigner[]) || [];
  const firstSigner = signers[0];

  return NextResponse.json({
    contract: {
      id: contract.id,
      title: contract.title,
      content: contract.content,
      status: contract.status,
      createdAt: contract.createdAt.toISOString(),
      freelancerName: contract.user.companyName || contract.user.name || contract.user.email,
      clientName: contract.client?.name,
      signerName: firstSigner?.name ?? contract.client?.name ?? "",
      signerEmail: firstSigner?.email ?? contract.client?.email ?? "",
    },
  });
}

// POST /api/contracts/sign — submit signature (no auth required)
export async function POST(req: Request) {
  try {
    const { token, signature, signerName } = await req.json();

    if (!token || !signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const contract = await prisma.contract.findFirst({
      where: { signingToken: token },
    });

    if (!contract) {
      return NextResponse.json({ error: "Invalid signing link" }, { status: 404 });
    }

    if (contract.status === "SIGNED") {
      return NextResponse.json({ error: "Already signed" }, { status: 409 });
    }

    const signers = (contract.signers as unknown as ContractSigner[]) || [];

    // Mark first pending signer as signed, or add a new entry
    let updated = false;
    const updatedSigners = signers.map((s: ContractSigner) => {
      if (!updated && s.status !== "SIGNED") {
        updated = true;
        return {
          ...s,
          name: signerName || s.name,
          status: "SIGNED" as const,
          signedAt: new Date().toISOString(),
          signature,
        };
      }
      return s;
    });

    if (!updated) {
      updatedSigners.push({
        name: signerName || "Signer",
        email: "",
        status: "SIGNED",
        signedAt: new Date().toISOString(),
        signature,
      });
    }

    const allSigned = updatedSigners.every((s: ContractSigner) => s.status === "SIGNED");

    await prisma.contract.update({
      where: { id: contract.id },
      data: {
        signers: updatedSigners as never,
        status: allSigned ? "SIGNED" : "PENDING_SIGNATURE",
        ...(allSigned ? { signedAt: new Date() } : {}),
      },
    });

    // Notify contract owner when all parties have signed
    if (allSigned) {
      await prisma.notification.create({
        data: {
          userId: contract.userId,
          type: "CONTRACT_SIGNED",
          title: `Contract signed: ${contract.title}`,
          message: `${signerName || "Your client"} has signed the contract`,
          link: `/contracts/${contract.id}`,
        },
      });
    }

    return NextResponse.json({ success: true, allSigned });
  } catch (error) {
    console.error("Sign error:", error);
    return NextResponse.json({ error: "Failed to sign contract" }, { status: 500 });
  }
}

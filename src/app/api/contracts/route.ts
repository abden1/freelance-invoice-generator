import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { contractSchema } from "@/lib/validations";
import { randomBytes } from "crypto";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const contracts = await prisma.contract.findMany({
    where: {
      userId: session.user.id,
      ...(status ? { status: status as never } : {}),
    },
    include: {
      client: { select: { id: true, name: true, email: true, company: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ contracts });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = contractSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const signingToken = randomBytes(32).toString("hex");

  const contract = await prisma.contract.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
      signers: parsed.data.signers as never,
      signingToken,
    },
    include: {
      client: { select: { id: true, name: true, email: true, company: true } },
    },
  });

  return NextResponse.json({ contract }, { status: 201 });
}

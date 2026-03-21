import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPortalSession } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = await createPortalSession(session.user.id);
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "No billing account found" }, { status: 400 });
  }
}

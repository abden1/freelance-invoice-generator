import { NextResponse } from "next/server";
import { getExchangeRates } from "@/lib/currencies";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const base = searchParams.get("base") || "USD";

  const rates = await getExchangeRates(base);
  return NextResponse.json({ base, rates });
}

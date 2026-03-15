import { NextRequest, NextResponse } from "next/server";
import { fetchLivePricingComps, isShoppingConfigured } from "@/lib/shopping";
import type { ConditionGrade } from "@/lib/types";

export async function GET(req: NextRequest) {
  if (!isShoppingConfigured()) {
    return NextResponse.json(
      { error: "Live Google Shopping pricing is not configured on the server." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const title     = searchParams.get("title") ?? searchParams.get("category") ?? "Product";
  const category  = searchParams.get("category") ?? "General";
  const brand     = searchParams.get("brand") ?? "Unknown";
  const condition = (searchParams.get("condition") ?? "Good") as ConditionGrade;

  try {
    const data = await fetchLivePricingComps({ title, category, brand, condition });
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load live pricing comps";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

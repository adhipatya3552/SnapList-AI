import { NextRequest, NextResponse } from "next/server";
import { analyzeProductImage } from "@/lib/openrouter";
import { fetchLivePricingComps, isShoppingConfigured } from "@/lib/shopping";
import { buildPlatformRecommendations } from "@/lib/platform-router";
import type { ListingTemplateContext } from "@/lib/types";
import { randomUUID } from "crypto";

// Increase body size limit to 20MB for large product images (batch of 10)
export const maxDuration = 60; // seconds
export const dynamic   = "force-dynamic";

// Next.js App Router route segment config — raise the 4MB default
export const fetchCache = "default-no-store";

export async function POST(req: NextRequest) {
  // Validate API key is loaded
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("[analyze-listing] OPENROUTER_API_KEY is not set");
    return NextResponse.json(
      { error: "Server misconfiguration: missing API key" },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];
    const templateContext = parseTemplateContext(formData.get("templateContext"));

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    console.log(`[analyze-listing] Processing ${files.length} image(s), sizes: ${files.map(f => f.size).join(", ")} bytes`);

    const results = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64 = buffer.toString("base64");
        const mimeType = file.type || "image/jpeg";

        console.log(`[analyze-listing] Calling OpenRouter with ${mimeType}, base64 length: ${base64.length}`);
        const result = await analyzeProductImage(base64, mimeType, templateContext);

        let livePricing = null;
        if (isShoppingConfigured()) {
          try {
            livePricing = await fetchLivePricingComps({
              title: result.title,
              category: result.category,
              brand: result.brand,
              condition: result.condition,
            });
          } catch (pricingError) {
            console.error("[analyze-listing] live pricing enrichment failed:", pricingError);
          }
        }

        const priceRange = livePricing
          ? {
              low: livePricing.low,
              avg: livePricing.avg,
              high: livePricing.high,
            }
          : result.priceRange;

        const platformRecommendation = buildPlatformRecommendations({
          title: result.title,
          category: result.category,
          brand: result.brand,
          condition: result.condition,
          priceRange,
          marketCompSampleSize: livePricing?.sampleSize ?? 0,
        });

        return {
          id: randomUUID(),
          ...result,
          priceRange,
          platformRecommendation,
        };
      })
    );

    return NextResponse.json({ results });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[analyze-listing] error:", msg);
    if (err instanceof Error) console.error("[analyze-listing] stack:", err.stack);
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}

function parseTemplateContext(value: FormDataEntryValue | null): ListingTemplateContext | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  try {
    return JSON.parse(value) as ListingTemplateContext;
  } catch {
    return null;
  }
}

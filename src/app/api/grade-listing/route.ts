import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { ReportCardResult, Grade, ReportCardBreakdown } from "@/lib/types";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

function getClient() {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY ?? "placeholder",
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "SnapList AI",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, price } = await req.json();

    const prompt = `You are an expert resale listing evaluator. Grade this listing out of 100 points.
Title: ${title}
Description: ${description}
Price: $${price ?? "not provided"}

Return ONLY valid JSON:
{
  "titleKeywords": 0-25,
  "descriptionQuality": 0-25,
  "priceVsMarket": 0-25,
  "platformFit": 0-25,
  "suggestions": ["specific actionable suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4"]
}
Be strict. A score of 20+/25 means excellent. Most listings score 10-15/25 per category.`;

    const client = getClient();
    const response = await client.chat.completions.create({
      model: "google/gemini-2.0-flash-001",   // ✅ fixed — was deprecated gemini-flash-1.5
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const cleaned = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const breakdown: ReportCardBreakdown = {
      titleKeywords:     Math.min(25, Math.max(0, parsed.titleKeywords ?? 10)),
      descriptionQuality:Math.min(25, Math.max(0, parsed.descriptionQuality ?? 10)),
      priceVsMarket:     Math.min(25, Math.max(0, parsed.priceVsMarket ?? 10)),
      platformFit:       Math.min(25, Math.max(0, parsed.platformFit ?? 10)),
    };
    const score = breakdown.titleKeywords + breakdown.descriptionQuality + breakdown.priceVsMarket + breakdown.platformFit;
    const grade: Grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 45 ? "D" : "F";

    const result: ReportCardResult = { score, grade, breakdown, suggestions: parsed.suggestions ?? [] };
    return NextResponse.json(result);
  } catch (err) {
    console.error("[grade-listing] error:", err);
    return NextResponse.json({ error: "Failed to grade listing" }, { status: 500 });
  }
}

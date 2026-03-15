import OpenAI from "openai";
import type {
  ListingResult,
  ListingDescriptions,
  ConditionGrade,
  PlatformRecommendation,
  ListingTemplateContext,
} from "./types";

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

const MODEL = "google/gemini-2.0-flash-001";

const BASE_SYSTEM_PROMPT = `You are an expert resale listing assistant for platforms like eBay, Poshmark, Etsy, and Facebook Marketplace.
Analyze the product photo and return ONLY valid JSON (no markdown, no code fences) matching this exact schema:
{
  "title": "SEO-optimized title, 80 chars max",
  "description_poshmark": "casual, social tone, emoji-friendly, 100-150 words",
  "description_ebay": "keyword-dense, technical specification style, 100-150 words",
  "description_etsy": "narrative, story-driven, craft/vintage appeal, 100-150 words",
  "description_facebook": "friendly, local buyer tone, brief, 60-80 words",
  "condition": "New | Like New | Good | Fair | Poor",
  "condition_notes": ["array of specific visible flaws, or empty array if none"],
  "category": "primary product category (e.g. Women's Tops, Sneakers, Electronics, Kitchen Appliances)",
  "brand": "detected brand name, or Unknown",
  "platform_recommendation": [
    {"platform": "eBay", "reason": "brief one-sentence reason"},
    {"platform": "Poshmark", "reason": "..."},
    {"platform": "Etsy", "reason": "..."},
    {"platform": "Facebook Marketplace", "reason": "..."},
    {"platform": "Vinted", "reason": "..."}
  ],
  "price_low": 0,
  "price_avg": 0,
  "price_high": 0,
  "confidence": 0.0
}
Rank platform_recommendation from best fit to worst. Base price estimates on current resale market values. confidence is your certainty 0.0-1.0.`;

interface RawAIResponse {
  title: string;
  description_poshmark: string;
  description_ebay: string;
  description_etsy: string;
  description_facebook: string;
  condition: ConditionGrade;
  condition_notes: string[];
  category: string;
  brand: string;
  platform_recommendation: { platform: string; reason: string }[];
  price_low: number;
  price_avg: number;
  price_high: number;
  confidence: number;
}

export async function analyzeProductImage(
  imageBase64: string,
  mimeType: string = "image/jpeg",
  templateContext?: ListingTemplateContext | null
): Promise<Omit<ListingResult, "id" | "imagePreviewUrl">> {
  const client = getClient();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: MODEL,
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: buildSystemPrompt(templateContext) },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${imageBase64}` },
              },
            ],
          },
        ],
      });

      const raw = response.choices[0]?.message?.content ?? "";
      const cleaned = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      const parsed: RawAIResponse = JSON.parse(cleaned);

      const descriptions: ListingDescriptions = {
        poshmark: parsed.description_poshmark,
        ebay:     parsed.description_ebay,
        etsy:     parsed.description_etsy,
        facebook: parsed.description_facebook,
      };

      const platformRecommendation: PlatformRecommendation[] =
        parsed.platform_recommendation.map((p) => ({
          platform: p.platform as PlatformRecommendation["platform"],
          reason: p.reason,
        }));

      return {
        title: parsed.title,
        descriptions,
        condition: parsed.condition,
        conditionNotes: parsed.condition_notes ?? [],
        category: parsed.category,
        brand: parsed.brand,
        platformRecommendation,
        priceRange: {
          low: parsed.price_low,
          avg: parsed.price_avg,
          high: parsed.price_high,
        },
        confidence: parsed.confidence,
        flaggedForReview: parsed.confidence < 0.6,
      };
    } catch (err) {
      lastError = err as Error;
      await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
    }
  }

  throw lastError ?? new Error("Failed to analyze image after 3 attempts");
}

function buildSystemPrompt(templateContext?: ListingTemplateContext | null) {
  if (!templateContext) return BASE_SYSTEM_PROMPT;

  return `${BASE_SYSTEM_PROMPT}

Additional context from the user's saved template:
- Template name: ${templateContext.name}
- Likely category: ${templateContext.category}
- Preferred starting platform: ${templateContext.platform}
- Title hint: ${templateContext.titleHint}

Use this as soft guidance only. If the photo clearly contradicts the template, trust the image.`;
}

import type {
  ComparableListing,
  ConditionGrade,
  PlatformPrice,
  PricingComps,
} from "./types";

const SERPAPI_BASE_URL = "https://serpapi.com/search.json";
const GOOGLE_COUNTRY = process.env.GOOGLE_SHOPPING_GL ?? "us";
const GOOGLE_LANGUAGE = process.env.GOOGLE_SHOPPING_HL ?? "en";

interface LiveCompInput {
  title: string;
  category: string;
  brand: string;
  condition: ConditionGrade;
}

interface SerpApiShoppingResponse {
  shopping_results?: SerpApiShoppingResult[];
}

interface SerpApiShoppingResult {
  position?: number;
  title?: string;
  source?: string;
  product_link?: string;
  extracted_price?: number;
  price?: string;
  shipping?: string;
  delivery?: string;
  thumbnail?: string;
}

const STOP_WORDS = new Set([
  "the",
  "and",
  "with",
  "for",
  "from",
  "size",
  "item",
  "product",
  "listing",
  "resale",
  "used",
  "new",
  "good",
  "fair",
]);

export function isShoppingConfigured() {
  return Boolean(process.env.SERPAPI_API_KEY);
}

export async function fetchLivePricingComps({
  title,
  category,
  brand,
  condition,
}: LiveCompInput): Promise<PricingComps> {
  if (!isShoppingConfigured()) {
    throw new Error("Missing SerpApi key");
  }

  const query = buildSearchQuery({ title, category, brand });
  const url = new URL(SERPAPI_BASE_URL);
  url.searchParams.set("engine", "google_shopping");
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", process.env.SERPAPI_API_KEY ?? "");
  url.searchParams.set("gl", GOOGLE_COUNTRY);
  url.searchParams.set("hl", GOOGLE_LANGUAGE);
  url.searchParams.set("no_cache", "true");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SerpApi Google Shopping failed (${response.status}): ${errorText}`);
  }

  const payload = (await response.json()) as SerpApiShoppingResponse;
  const comparables = scoreComparables(payload.shopping_results ?? [], condition).slice(0, 12);

  if (comparables.length === 0) {
    throw new Error("No live Google Shopping comparables found");
  }

  const prices = comparables
    .map((item) => item.price)
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);

  if (prices.length === 0) {
    throw new Error("Comparable listings did not contain usable prices");
  }

  const low = Math.round(percentile(prices, 0.25));
  const avg = Math.round(percentile(prices, 0.5));
  const high = Math.round(percentile(prices, 0.75));

  const platforms: PlatformPrice[] = [
    {
      platform: "Google Shopping",
      avgPrice: avg,
      sampleSize: comparables.length,
    },
  ];

  return {
    low,
    avg,
    high,
    sampleSize: comparables.length,
    platforms,
    category,
    brand,
    condition,
    source: "google-shopping-live",
    priceBasis: "live_listings",
    query,
    generatedAt: new Date().toISOString(),
    comparables,
    notes: [
      "Live market comps are based on current Google Shopping listings pulled in real time.",
      "Pricing uses the middle of the current market instead of a single outlier listing.",
    ],
  };
}

function buildSearchQuery({
  title,
  category,
  brand,
}: Pick<LiveCompInput, "title" | "category" | "brand">) {
  const parts = new Set<string>();

  if (brand && brand !== "Unknown") {
    parts.add(brand.trim());
  }

  for (const token of keywordize(title)) {
    parts.add(token);
  }

  for (const token of keywordize(category).slice(0, 2)) {
    parts.add(token);
  }

  return Array.from(parts).slice(0, 8).join(" ");
}

function keywordize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
    .slice(0, 6);
}

function scoreComparables(results: SerpApiShoppingResult[], requestedCondition: ConditionGrade) {
  return results
    .map((result) => toComparable(result))
    .filter((item): item is ComparableListing => item !== null)
    .sort((a, b) => {
      const conditionScoreDiff =
        conditionDistance(normalizeCondition(a.condition), requestedCondition) -
        conditionDistance(normalizeCondition(b.condition), requestedCondition);
      if (conditionScoreDiff !== 0) return conditionScoreDiff;
      return a.price - b.price;
    });
}

function toComparable(result: SerpApiShoppingResult): ComparableListing | null {
  const basePrice =
    typeof result.extracted_price === "number"
      ? result.extracted_price
      : parsePriceString(result.price);

  if (!result.title || !basePrice) {
    return null;
  }

  return {
    source: "Google Shopping",
    itemId: `${result.source ?? "shopping"}-${result.position ?? result.title}`,
    title: result.title,
    price: Math.round(basePrice),
    currency: "USD",
    condition: inferConditionFromText(`${result.title} ${result.delivery ?? ""}`),
    itemWebUrl: result.product_link,
    imageUrl: result.thumbnail,
  };
}

function parsePriceString(value?: string) {
  if (!value) return null;
  const match = value.replace(/,/g, "").match(/(\d+(\.\d+)?)/);
  if (!match) return null;
  const parsed = Number.parseFloat(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function inferConditionFromText(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("brand new") || normalized.includes("new")) return "New";
  if (normalized.includes("open box") || normalized.includes("refurbished")) return "Like New";
  if (normalized.includes("used")) return "Good";
  return undefined;
}

function normalizeCondition(value?: string): ConditionGrade {
  const normalized = (value ?? "").toLowerCase();

  if (!normalized) return "Good";
  if (normalized.includes("brand new") || normalized === "new" || normalized.includes("new with")) {
    return "New";
  }
  if (
    normalized.includes("open box") ||
    normalized.includes("excellent") ||
    normalized.includes("very good") ||
    normalized.includes("refurbished")
  ) {
    return "Like New";
  }
  if (normalized.includes("good") || normalized.includes("used")) {
    return "Good";
  }
  if (normalized.includes("acceptable") || normalized.includes("fair")) {
    return "Fair";
  }
  if (normalized.includes("parts") || normalized.includes("broken") || normalized.includes("poor")) {
    return "Poor";
  }

  return "Good";
}

function conditionDistance(left: ConditionGrade, right: ConditionGrade) {
  const rank: Record<ConditionGrade, number> = {
    New: 0,
    "Like New": 1,
    Good: 2,
    Fair: 3,
    Poor: 4,
  };

  return Math.abs(rank[left] - rank[right]);
}

function percentile(sorted: number[], ratio: number) {
  if (sorted.length === 1) return sorted[0];

  const index = (sorted.length - 1) * ratio;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) return sorted[lower];

  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

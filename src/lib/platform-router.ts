import type {
  ConditionGrade,
  Platform,
  PlatformRecommendation,
  PriceRange,
} from "./types";

interface RouterInput {
  title: string;
  category: string;
  brand: string;
  condition: ConditionGrade;
  priceRange: PriceRange;
  marketCompSampleSize?: number;
}

const ALL_PLATFORMS: Platform[] = [
  "eBay",
  "Poshmark",
  "Etsy",
  "Facebook Marketplace",
  "Vinted",
  "Mercari",
];

export function buildPlatformRecommendations({
  title,
  category,
  brand,
  condition,
  priceRange,
  marketCompSampleSize = 0,
}: RouterInput): PlatformRecommendation[] {
  const haystack = `${title} ${category} ${brand}`.toLowerCase();
  const scores = new Map<Platform, number>(ALL_PLATFORMS.map((platform) => [platform, 0]));

  addBaseScore(scores, "eBay", 2);
  addBaseScore(scores, "Mercari", 1);

  if (hasAny(haystack, ["dress", "jeans", "shirt", "sneaker", "shoe", "handbag", "apparel", "fashion"])) {
    addBaseScore(scores, "Poshmark", 5);
    addBaseScore(scores, "Vinted", 3);
    addBaseScore(scores, "eBay", 2);
  }

  if (hasAny(haystack, ["vintage", "handmade", "artisan", "antique", "decor", "jewelry", "collectible"])) {
    addBaseScore(scores, "Etsy", 5);
    addBaseScore(scores, "eBay", 2);
  }

  if (hasAny(haystack, ["electronics", "phone", "laptop", "camera", "console", "apple", "sony"])) {
    addBaseScore(scores, "eBay", 5);
    addBaseScore(scores, "Facebook Marketplace", 1);
    addBaseScore(scores, "Mercari", 2);
  }

  if (hasAny(haystack, ["furniture", "chair", "table", "lamp", "appliance", "pickup", "local"])) {
    addBaseScore(scores, "Facebook Marketplace", 5);
    addBaseScore(scores, "eBay", 1);
  }

  if (brand !== "Unknown" && hasAny(haystack, ["nike", "lululemon", "patagonia", "gucci", "prada", "chanel"])) {
    addBaseScore(scores, "Poshmark", 2);
    addBaseScore(scores, "eBay", 2);
  }

  if (priceRange.avg >= 150) {
    addBaseScore(scores, "eBay", 2);
    addBaseScore(scores, "Poshmark", 1);
    addBaseScore(scores, "Etsy", 1);
  }

  if (condition === "Fair" || condition === "Poor") {
    addBaseScore(scores, "eBay", 2);
    addBaseScore(scores, "Facebook Marketplace", 1);
  }

  return ALL_PLATFORMS.map((platform) => ({
    platform,
    reason: buildReason(platform, { haystack, condition, priceRange, marketCompSampleSize }),
    score: scores.get(platform) ?? 0,
  }))
    .sort((left, right) => right.score - left.score)
    .map(({ platform, reason }) => ({ platform, reason }));
}

function buildReason(
  platform: Platform,
  {
    haystack,
    condition,
    priceRange,
    marketCompSampleSize,
  }: Pick<RouterInput, "condition" | "priceRange"> & {
    haystack: string;
    marketCompSampleSize: number;
  }
) {
  switch (platform) {
    case "eBay":
      if (marketCompSampleSize > 0) {
        return `Current market comps cluster around $${priceRange.avg}, and eBay is still the strongest first channel for broad buyer reach on this item.`;
      }
      return "Broad buyer reach and strong keyword search make eBay the safest first listing for this item.";
    case "Poshmark":
      return hasAny(haystack, ["dress", "jeans", "shirt", "sneaker", "shoe", "handbag", "fashion"])
        ? "Best fit for branded fashion buyers who shop by style, closet curation, and bundle offers."
        : "Useful when the item benefits from fashion-first discovery and social-style listing copy.";
    case "Etsy":
      return hasAny(haystack, ["vintage", "handmade", "artisan", "antique", "decor", "jewelry"])
        ? "Strong niche for vintage and handmade discovery where story-driven listings command premium pricing."
        : "Worth testing if the item has vintage, collectible, or design-led appeal.";
    case "Facebook Marketplace":
      return hasAny(haystack, ["furniture", "chair", "table", "lamp", "appliance", "local"])
        ? "Best option when local pickup matters and buyers expect to inspect condition in person."
        : condition === "Fair" || condition === "Poor"
          ? "Good fallback for quick local sales on items that need a buyer comfortable with visible wear."
          : "Useful for local demand and fast turnaround when shipping is inconvenient.";
    case "Vinted":
      return "Good secondary channel for everyday apparel where buyers expect value pricing and quick relists.";
    case "Mercari":
      return "Solid secondary marketplace for general merchandise when you want another national audience and quick relist potential.";
  }
}

function hasAny(haystack: string, needles: string[]) {
  return needles.some((needle) => haystack.includes(needle));
}

function addBaseScore(scores: Map<Platform, number>, platform: Platform, amount: number) {
  scores.set(platform, (scores.get(platform) ?? 0) + amount);
}

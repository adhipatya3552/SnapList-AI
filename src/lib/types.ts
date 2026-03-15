// ── Listing Types ─────────────────────────────────────────────────────────

export type ConditionGrade = "New" | "Like New" | "Good" | "Fair" | "Poor";

export type Platform =
  | "eBay"
  | "Poshmark"
  | "Vinted"
  | "Facebook Marketplace"
  | "Etsy"
  | "Mercari";

export interface PlatformRecommendation {
  platform: Platform;
  reason: string;
}

export interface PriceRange {
  low: number;
  avg: number;
  high: number;
}

export interface ListingDescriptions {
  poshmark: string;
  ebay: string;
  etsy: string;
  facebook: string;
}

export interface ListingResult {
  id: string; // client-side uuid
  title: string;
  descriptions: ListingDescriptions;
  condition: ConditionGrade;
  conditionNotes: string[];
  category: string;
  brand: string;
  platformRecommendation: PlatformRecommendation[];
  priceRange: PriceRange;
  confidence: number; // 0.0 – 1.0
  flaggedForReview: boolean;
  imagePreviewUrl?: string; // Object URL for client preview
}

// ── Pricing Comps ─────────────────────────────────────────────────────────

export interface PlatformPrice {
  platform: Platform | "Google Shopping";
  avgPrice: number;
  sampleSize: number;
}

export interface ComparableListing {
  source: "Google Shopping";
  itemId: string;
  title: string;
  price: number;
  currency: string;
  condition?: string;
  itemWebUrl?: string;
  imageUrl?: string;
  itemOriginDate?: string;
}

export interface PricingComps {
  low: number;
  avg: number;
  high: number;
  sampleSize: number;
  platforms: PlatformPrice[];
  category: string;
  brand: string;
  condition: ConditionGrade;
  source: "google-shopping-live";
  priceBasis: "live_listings";
  query: string;
  generatedAt: string;
  comparables: ComparableListing[];
  notes: string[];
}

// ── Draft Vault ───────────────────────────────────────────────────────────

export interface DraftListing {
  id: string;
  listing: ListingResult;
  savedAt: number; // unix ms
  userPrice?: number;
  selectedPlatform?: Platform;
  templateName?: string;
}

export interface ListingTemplateContext {
  name: string;
  category: string;
  platform: string;
  titleHint: string;
}

// ── Report Card ───────────────────────────────────────────────────────────

export type Grade = "A" | "B" | "C" | "D" | "F";

export interface ReportCardBreakdown {
  titleKeywords: number;     // 0–25
  descriptionQuality: number; // 0–25
  priceVsMarket: number;     // 0–25
  platformFit: number;       // 0–25
}

export interface ReportCardResult {
  score: number; // 0–100
  grade: Grade;
  breakdown: ReportCardBreakdown;
  suggestions: string[];
}

// ── User / Freemium ───────────────────────────────────────────────────────

export type Plan = "free" | "hustler" | "flipper" | "pro";

export interface UserCredits {
  used: number;
  limit: number; // 10 | 100 | 500 | Infinity
  plan: Plan;
}

export const PLAN_LIMITS: Record<Plan, number> = {
  free:     10,
  hustler:  100,
  flipper:  500,
  pro:      Infinity,
};

export const PLAN_PRICES: Record<Exclude<Plan, "free">, number> = {
  hustler: 12,
  flipper: 24,
  pro:     49,
};

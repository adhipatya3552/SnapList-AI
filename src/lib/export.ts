import type { ListingResult } from "./types";

/**
 * Convert an array of AI-generated listing results to a CSV string.
 */
export function listingsToCSV(results: ListingResult[]): string {
  const headers = [
    "Title",
    "Category",
    "Brand",
    "Condition",
    "Price Low",
    "Price Avg",
    "Price High",
    "Best Platform",
    "Description (Poshmark)",
    "Description (eBay)",
    "Description (Etsy)",
    "Description (Facebook)",
    "Condition Notes",
  ];

  const escape = (v: unknown) => {
    const s = String(v ?? "").replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = results.map((r) => [
    escape(r.title),
    escape(r.category),
    escape(r.brand),
    escape(r.condition),
    escape(r.priceRange.low),
    escape(r.priceRange.avg),
    escape(r.priceRange.high),
    escape(r.platformRecommendation[0]?.platform ?? ""),
    escape(r.descriptions.poshmark),
    escape(r.descriptions.ebay),
    escape(r.descriptions.etsy),
    escape(r.descriptions.facebook),
    escape(r.conditionNotes.join("; ")),
  ]);

  return [headers.map((h) => `"${h}"`).join(","), ...rows.map((row) => row.join(","))].join("\n");
}

/**
 * Trigger a CSV file download in the browser.
 */
export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

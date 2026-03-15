"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { useDraftsStore } from "@/store/drafts";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/../convex/_generated/api";
import { Bookmark, Trash2, Copy, CheckCircle, Folder, FileDown, CloudOff } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { downloadCSV } from "@/lib/export";
import type { ListingResult } from "@/lib/types";

const CONDITION_COLORS: Record<string, string> = {
  "New":      "text-emerald-400",
  "Like New": "text-green-400",
  "Good":     "text-amber-400",
  "Fair":     "text-orange-400",
  "Poor":     "text-rose-400",
};

export default function VaultPage() {
  const { user }               = useUser();
  const { drafts, remove: removeLocal } = useDraftsStore();
  const removeConvex           = useMutation(api.listings.remove);
  const [filter, setFilter]    = useState<string>("all");
  const [copiedId, setCopied]  = useState<string | null>(null);

  // ── Convex data (real-time, cross-device) ──────────────────────────
  const convexDrafts = useQuery(
    api.listings.listByUser,
    user?.id ? { userId: user.id } : "skip"
  );

  // Prefer Convex data when signed in; fall back to localStorage drafts
  const isConvexReady = !!user?.id && convexDrafts !== undefined;

  // Normalise Convex docs into the same shape as local DraftListing
  const allDrafts = isConvexReady
    ? (convexDrafts ?? []).map((d) => ({
        id:        d._id,
        convexId:  d._id,
        savedAt:   d.savedAt,
        listing: {
          id:            d._id,
          title:         d.title,
          descriptions:  d.descriptions,
          condition:     d.condition as ListingResult["condition"],
          conditionNotes: d.conditionNotes,
          category:      d.category,
          brand:         d.brand,
          platformRecommendation: d.platformRecommendation as ListingResult["platformRecommendation"],
          priceRange:    d.priceRange,
          confidence:    d.confidence,
          flaggedForReview: d.flaggedForReview,
          imagePreviewUrl: undefined,
        } satisfies ListingResult,
        userPrice:        d.userPrice,
        selectedPlatform: d.selectedPlatform,
      }))
    : drafts;

  const categories = ["all", ...Array.from(new Set(allDrafts.map((d) => d.listing.category)))];
  const filtered   = filter === "all" ? allDrafts : allDrafts.filter((d) => d.listing.category === filter);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleRemove = async (id: string) => {
    if (isConvexReady) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await removeConvex({ id: id as any });
    } else {
      removeLocal(id);
    }
  };

  const handleCopy = (draft: typeof allDrafts[0]) => {
    const text = [
      draft.listing.title,
      "",
      draft.listing.descriptions.poshmark,
      "",
      `Price: $${draft.userPrice ?? draft.listing.priceRange.avg}`,
      `Condition: ${draft.listing.condition}`,
      `Best on: ${draft.listing.platformRecommendation[0]?.platform ?? ""}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(draft.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleExportCSV = () => {
    const listings = filtered.map((d) => d.listing);
    const rows = listings.map((r) => {
      const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      return [
        esc(r.title), esc(r.category), esc(r.brand), esc(r.condition),
        esc(r.priceRange.low), esc(r.priceRange.avg), esc(r.priceRange.high),
        esc(r.platformRecommendation[0]?.platform ?? ""),
        esc(r.descriptions.poshmark), esc(r.descriptions.ebay),
        esc(r.descriptions.etsy), esc(r.descriptions.facebook),
        esc(r.conditionNotes.join("; ")),
      ].join(",");
    });
    const headers = [
      "Title","Category","Brand","Condition","Price Low","Price Avg","Price High",
      "Best Platform","Description (Poshmark)","Description (eBay)",
      "Description (Etsy)","Description (Facebook)","Condition Notes",
    ].map((h) => `"${h}"`).join(",");
    downloadCSV([headers, ...rows].join("\n"), `vault-export-${Date.now()}.csv`);
  };

  return (
    <AppShell>
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6" aria-label="Draft Vault">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Bookmark className="h-6 w-6 text-[var(--violet-light)]" aria-hidden="true" />
              Draft Vault
            </h1>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-sm text-[var(--text-secondary)]">{allDrafts.length} saved</span>
              {isConvexReady
                ? <span className="text-[10px] text-[var(--emerald)] bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] rounded-full px-2 py-0.5">☁ Synced</span>
                : <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]"><CloudOff className="h-3 w-3" aria-hidden="true" /> Local only</span>
              }
            </div>
          </div>
          {allDrafts.length > 0 && (
            <button
              onClick={handleExportCSV}
              aria-label="Export vault drafts as CSV"
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[var(--violet)] transition-all"
            >
              <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
              Export CSV
            </button>
          )}
        </div>

        {/* Category filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                aria-pressed={filter === cat}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium capitalize transition-all",
                  filter === cat
                    ? "bg-[var(--violet)] text-white"
                    : "border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--violet)] hover:text-[var(--violet-light)]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {allDrafts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-elevated)] mb-4">
              <Folder className="h-8 w-8 text-[var(--text-muted)]" aria-hidden="true" />
            </div>
            <p className="text-[var(--text-secondary)] font-medium">No drafts saved yet</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">Analyze a product and click the bookmark icon to save it here.</p>
            <Link href="/analyze">
              <button className="mt-4 rounded-lg bg-[var(--violet)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6D28D9] transition-colors">
                Start Analyzing
              </button>
            </Link>
          </div>
        )}

        {/* Draft list */}
        <AnimatePresence>
          {filtered.map((draft, i) => (
            <motion.article
              key={draft.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4 flex flex-col sm:flex-row gap-4"
              aria-label={draft.listing.title}
            >
              {/* Image preview */}
              {draft.listing.imagePreviewUrl && (
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-elevated)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={draft.listing.imagePreviewUrl} alt={draft.listing.title} className="h-full w-full object-cover" />
                </div>
              )}

              <div className="flex-1 min-w-0 space-y-1.5">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-2">{draft.listing.title}</h3>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[var(--text-muted)]">{draft.listing.category}</span>
                  {draft.listing.brand !== "Unknown" && (
                    <span className="text-[var(--text-muted)]">• {draft.listing.brand}</span>
                  )}
                  <span className={cn("font-medium", CONDITION_COLORS[draft.listing.condition])}>
                    • {draft.listing.condition}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                  <span>${draft.userPrice ?? draft.listing.priceRange.low}–${draft.listing.priceRange.high}</span>
                  <span className="text-[var(--text-muted)]">{new Date(draft.savedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Best on: <span className="text-[var(--violet-light)]">{draft.listing.platformRecommendation[0]?.platform}</span>
                </p>
              </div>

              <div className="flex sm:flex-col items-center gap-2 shrink-0">
                {/* Delete */}
                <button
                  onClick={() => handleRemove(draft.id)}
                  aria-label={`Delete draft: ${draft.listing.title}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:bg-[rgba(244,63,94,0.15)] hover:text-[var(--rose)] transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                {/* Copy listing to clipboard */}
                <button
                  onClick={() => handleCopy(draft)}
                  aria-label={copiedId === draft.id ? "Copied!" : `Copy listing: ${draft.listing.title}`}
                  title="Copy listing to clipboard"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--violet-light)] hover:bg-[var(--violet-glow)] transition-all"
                >
                  {copiedId === draft.id
                    ? <CheckCircle className="h-3.5 w-3.5 text-[var(--emerald)]" aria-hidden="true" />
                    : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                </button>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </main>
    </AppShell>
  );
}

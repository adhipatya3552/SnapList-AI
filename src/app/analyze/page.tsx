"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageUploader } from "@/components/upload/ImageUploader";
import { ListingCard } from "@/components/listing/ListingCard";
import { PriceComps } from "@/components/listing/PriceComps";
import { TemplatesPanel } from "@/components/listing/TemplatesPanel";
import { UpgradeModal } from "@/components/upgrade/UpgradeModal";
import { AppShell } from "@/components/layout/AppShell";
import { useDraftsStore } from "@/store/drafts";
import { useCreditsStore } from "@/store/credits";
import type { ListingResult } from "@/lib/types";
import type { ListingTemplate } from "@/store/templates";
import { listingsToCSV, downloadCSV } from "@/lib/export";
import { Sparkles, AlertTriangle, Zap, FileDown } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";

export default function AnalyzePage() {
  const [results, setResults]         = useState<ListingResult[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [upgradeOpen, setUpgrade]     = useState(false);
  const [showComps, setShowComps]     = useState<string | null>(null);
  const [appliedTemplate, setApplied] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ListingTemplate | null>(null);
  // Per-result price overrides (from "Set My Price" in PriceComps)
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({});

  const { add: addDraft }              = useDraftsStore();
  const { consume, used, limit, plan } = useCreditsStore();
  const { user }                       = useUser();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const consumeCreditInDB = useMutation("users:consumeCredit" as any);
  const saveDraftToConvex = useMutation(api.listings.save);

  // Dual-write: local store (instant) + Convex DB (cross-device)
  const handleSaveDraft = async (result: ListingResult) => {
    addDraft(result); // instant local save
    if (user?.id) {
      saveDraftToConvex({
        userId:                result.id ? user.id : user.id,
        title:                 result.title,
        descriptions:          result.descriptions,
        condition:             result.condition,
        conditionNotes:        result.conditionNotes,
        category:              result.category,
        brand:                 result.brand,
        platformRecommendation: result.platformRecommendation,
        priceRange:            result.priceRange,
        confidence:            result.confidence,
        flaggedForReview:      result.flaggedForReview,
      }).catch(console.error); // fire-and-forget, don't block UI
    }
  };

  const remaining = Math.max(0, limit - used);
  const isAtLimit = used >= limit;

  const handleApplyTemplate = (tpl: ListingTemplate) => {
    setSelectedTemplate(tpl);
    setApplied(tpl.name);
    setTimeout(() => setApplied(null), 3000);
  };

  const handleSetPrice = (id: string, price: number) => {
    setPriceOverrides((prev) => ({ ...prev, [id]: price }));
    setResults((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, priceRange: { ...r.priceRange, avg: price } }
          : r
      )
    );
  };

  const handleExportCSV = () => {
    const csv = listingsToCSV(results);
    downloadCSV(csv, `snaplist-export-${Date.now()}.csv`);
  };

  const handleAnalyze = async (files: File[]) => {
    // --- Credit gate ---
    if (isAtLimit) {
      setUpgrade(true);
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("images", f));
      if (selectedTemplate) {
        formData.append("templateContext", JSON.stringify(selectedTemplate));
      }

      const res = await fetch("/api/analyze-listing", { method: "POST", body: formData });
      if (!res.ok) throw new Error((await res.json()).error ?? "Analysis failed");

      const { results: data } = await res.json();

      // 1. Decrement locally (instant UI feedback)
      const allowed = consume();
      if (!allowed) { setUpgrade(true); return; }

      // 2. Sync to Convex DB (fire-and-forget — doesn't block the UI)
      if (user?.id) {
        consumeCreditInDB({ clerkId: user.id }).catch(console.error);
      }

      // Attach preview URLs
      const withPreviews: ListingResult[] = data.map((r: ListingResult, i: number) => ({
        ...r,
        imagePreviewUrl: URL.createObjectURL(files[i] ?? files[0]),
      }));
      setResults(withPreviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-8" aria-label="AI Listing Generator">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[var(--violet-light)]" aria-hidden="true" />
            AI Listing Generator
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Upload a product photo and get a publish-ready listing in seconds.
          </p>
        </div>

        {/* Credit warning banner — shown when <= 2 credits left or at limit */}
        <AnimatePresence>
          {isAtLimit ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              role="alert"
              className="flex items-center justify-between gap-3 rounded-xl border border-[rgba(244,63,94,0.3)] bg-[rgba(244,63,94,0.08)] p-4"
            >
              <div className="flex items-center gap-2 text-sm text-[var(--rose)]">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>You&apos;ve used all <strong>{limit}</strong> listings on your <strong className="capitalize">{plan}</strong> plan.</span>
              </div>
              <button
                onClick={() => setUpgrade(true)}
                className="flex items-center gap-1.5 rounded-lg bg-[var(--violet)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#6D28D9] transition-all"
                aria-label="Upgrade your plan to get more listings"
              >
                <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                Upgrade
              </button>
            </motion.div>
          ) : remaining <= 2 && remaining > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              role="status"
              className="flex items-center justify-between gap-3 rounded-xl border border-[rgba(245,158,11,0.3)] bg-[var(--amber-glow)] p-4"
            >
              <div className="flex items-center gap-2 text-sm text-[var(--amber)]">
                <Zap className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>Only <strong>{remaining}</strong> listing{remaining > 1 ? "s" : ""} left this month on your <strong className="capitalize">{plan}</strong> plan.</span>
              </div>
              <button
                onClick={() => setUpgrade(true)}
                className="flex items-center gap-1.5 rounded-lg border border-[rgba(245,158,11,0.4)] bg-transparent px-3 py-1.5 text-xs font-semibold text-[var(--amber)] hover:bg-[rgba(245,158,11,0.15)] transition-all"
                aria-label="Upgrade to get more listings"
              >
                Get more →
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Templates Panel (visible once user has saved templates) */}
        <TemplatesPanel onApply={handleApplyTemplate} />

        {selectedTemplate && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[rgba(124,58,237,0.25)] bg-[var(--violet-glow)] p-4">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Using template: {selectedTemplate.name}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Future analyses will use this as soft guidance for category, title, and platform fit.
              </p>
            </div>
            <button
              onClick={() => setSelectedTemplate(null)}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-all hover:text-white"
            >
              Clear
            </button>
          </div>
        )}

        {/* Template applied toast */}
        <AnimatePresence>
          {appliedTemplate && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              role="status"
              className="rounded-lg border border-[rgba(245,158,11,0.3)] bg-[var(--amber-glow)] px-4 py-2.5 text-sm text-[var(--amber)]"
            >
              ✓ Template &ldquo;{appliedTemplate}&rdquo; context noted — upload your photo to continue
            </motion.div>
          )}
        </AnimatePresence>

        {/* Uploader */}
        <ImageUploader onAnalyze={handleAnalyze} isLoading={loading} />

        {/* Loading Skeleton */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-4"
              role="status"
              aria-label="Analyzing your product photos…"
            >
              {[0, 1].map((i) => (
                <div key={i} className="glass-card p-5 space-y-3" aria-hidden="true">
                  <div className="skeleton h-4 w-32" />
                  <div className="skeleton h-8 w-full" />
                  <div className="skeleton h-24 w-full" />
                  <div className="flex gap-2">
                    <div className="skeleton h-6 w-20" />
                    <div className="skeleton h-6 w-20" />
                    <div className="skeleton h-6 w-20" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-[rgba(244,63,94,0.3)] bg-[rgba(244,63,94,0.08)] p-4"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--rose)]" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-[var(--rose)]">Analysis failed</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {results.length > 0 && !loading && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6" aria-label="Analysis results">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--text-secondary)]">
                  ✅ Generated <strong className="text-[var(--text-primary)]">{results.length}</strong> listing{results.length > 1 ? "s" : ""}
                  {" · "}
                  <span className="text-[var(--text-muted)]">{remaining} listing{remaining !== 1 ? "s" : ""} remaining this month</span>
                </p>
                <button
                  onClick={handleExportCSV}
                  aria-label="Export all listings as CSV spreadsheet"
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[var(--violet)] transition-all"
                >
                  <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
                  Export CSV
                </button>
              </div>
              {results.map((result, i) => (
                <div key={result.id} className="space-y-3">
                  <ListingCard
                    result={result}
                    index={i}
                    onSave={handleSaveDraft}
                  />
                  <button
                    onClick={() => setShowComps(showComps === result.id ? null : result.id)}
                    className="text-xs text-[var(--violet-light)] hover:text-[var(--amber)] transition-colors"
                    aria-expanded={showComps === result.id}
                    aria-controls={`comps-${result.id}`}
                  >
                    {showComps === result.id ? "▲ Hide" : "▼ Show"} market pricing comps
                  </button>
                  <AnimatePresence>
                    {showComps === result.id && (
                      <motion.div
                        id={`comps-${result.id}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <PriceComps
                          title={result.title}
                          category={result.category}
                          brand={result.brand}
                          condition={result.condition}
                          suggestedAvg={priceOverrides[result.id] ?? result.priceRange.avg}
                          onSetPrice={(p) => handleSetPrice(result.id, p)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgrade(false)} />
    </AppShell>
  );
}

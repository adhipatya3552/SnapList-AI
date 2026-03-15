"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { Star, AlertTriangle, TrendingUp, ChevronRight, Lightbulb, Share2 } from "lucide-react";
import type { ReportCardResult, Grade } from "@/lib/types";
import { cn } from "@/lib/utils";

const GRADE_COLORS: Record<Grade, string> = {
  A: "text-[var(--emerald)] border-[rgba(16,185,129,0.4)] bg-[rgba(16,185,129,0.08)]",
  B: "text-[var(--amber-light)] border-[rgba(252,211,77,0.4)] bg-[rgba(252,211,77,0.06)]",
  C: "text-[var(--amber)] border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.08)]",
  D: "text-[#FB923C] border-[rgba(251,146,60,0.4)] bg-[rgba(251,146,60,0.08)]",
  F: "text-[var(--rose)] border-[rgba(244,63,94,0.4)] bg-[rgba(244,63,94,0.08)]",
};

const BREAKDOWN_LABELS = [
  { key: "titleKeywords",      label: "Title Keywords" },
  { key: "descriptionQuality", label: "Description Quality" },
  { key: "priceVsMarket",      label: "Price vs. Market" },
  { key: "platformFit",        label: "Platform Fit" },
] as const;

export default function ReportCardPage() {
  const [title,  setTitle]  = useState("");
  const [desc,   setDesc]   = useState("");
  const [price,  setPrice]  = useState("");
  const [result, setResult] = useState<ReportCardResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const handleGrade = async () => {
    if (!title.trim() && !desc.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/grade-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: desc, price: parseFloat(price) || undefined }),
      });
      if (!res.ok) throw new Error("Grading failed");
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleShareCard = () => {
    if (!result) return;
    const params = new URLSearchParams({
      score: String(result.score),
      grade: result.grade,
      title: title || "My Listing",
      tk: String(result.breakdown.titleKeywords),
      dq: String(result.breakdown.descriptionQuality),
      pm: String(result.breakdown.priceVsMarket),
      pf: String(result.breakdown.platformFit),
    });
    window.open(`/api/og?${params.toString()}`, "_blank");
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Star className="h-6 w-6 text-[var(--amber)]" />
            Listing Report Card
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Paste any existing listing and get an AI quality score. See exactly what you&apos;re leaving on the table.
          </p>
        </div>

        {/* Input form */}
        <div className="glass-card p-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Listing Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Nike Air Max 90 Sneakers Size 10"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--violet)] focus:outline-none focus:ring-1 focus:ring-[var(--violet)] transition-all placeholder:text-[var(--text-muted)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Description</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Paste your full item description here…"
              rows={5}
              className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--violet)] focus:outline-none focus:ring-1 focus:ring-[var(--violet)] transition-all placeholder:text-[var(--text-muted)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Your Listed Price ($)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 45"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--violet)] focus:outline-none focus:ring-1 focus:ring-[var(--violet)] transition-all placeholder:text-[var(--text-muted)]"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGrade}
            disabled={loading || (!title.trim() && !desc.trim())}
            className="w-full rounded-xl py-3 font-semibold text-white bg-gradient-to-r from-[var(--amber)] to-[var(--violet)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Grading your listing…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Grade My Listing
              </span>
            )}
          </motion.button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-[rgba(244,63,94,0.3)] bg-[rgba(244,63,94,0.08)] p-4 text-sm text-[var(--rose)]">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Score card */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-6">
                  <div className={cn("flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl border-2 text-4xl font-black", GRADE_COLORS[result.grade])}>
                    {result.grade}
                  </div>
                  <div className="flex-1">
                    <p className="text-3xl font-black text-[var(--text-primary)]">{result.score}<span className="text-lg font-normal text-[var(--text-muted)]">/100</span></p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      {result.score >= 80 ? "Great listing! Small tweaks could maximize returns." :
                       result.score >= 60 ? "Decent, but you're leaving money on the table." :
                       result.score >= 40 ? "Needs significant improvement to compete." :
                       "This listing needs a full rewrite to sell."}
                    </p>
                  </div>
                  {/* Share button */}
                  <button
                    onClick={handleShareCard}
                    aria-label="Open shareable score card image"
                    title="Open as shareable image"
                    className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-white hover:bg-[var(--violet)] transition-all shrink-0"
                  >
                    <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Share
                  </button>
                </div>
              </div>

              {/* Breakdown bars */}
              <div className="glass-card p-5 space-y-4">
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Score Breakdown</p>
                {BREAKDOWN_LABELS.map(({ key, label }) => {
                  const score = result.breakdown[key];
                  const pct = (score / 25) * 100;
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--text-secondary)]">{label}</span>
                        <span className="font-semibold text-[var(--text-primary)]">{score}/25</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[var(--bg-card)]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className={cn("h-full rounded-full", pct >= 80 ? "bg-[var(--emerald)]" : pct >= 60 ? "bg-[var(--amber)]" : "bg-[var(--rose)]")}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div className="glass-card p-5 space-y-3">
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-[var(--amber)]" />
                    What you&apos;re leaving on the table
                  </p>
                  <ul className="space-y-2">
                    {result.suggestions.map((s, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]"
                      >
                        <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--violet-light)]" />
                        {s}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle, AlertTriangle, Copy, Bookmark, ChevronDown, ChevronUp,
  Tag, Layers, Star, ExternalLink, LayoutTemplate
} from "lucide-react";
import type { ListingResult, Platform } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTemplatesStore } from "@/store/templates";

const CONDITION_COLORS: Record<string, string> = {
  "New":       "text-[var(--emerald)] bg-[rgba(16,185,129,0.12)] border-[rgba(16,185,129,0.3)]",
  "Like New":  "text-[#34D399] bg-[rgba(52,211,153,0.12)] border-[rgba(52,211,153,0.3)]",
  "Good":      "text-[var(--amber)] bg-[var(--amber-glow)] border-[rgba(245,158,11,0.3)]",
  "Fair":      "text-[#FB923C] bg-[rgba(251,146,60,0.12)] border-[rgba(251,146,60,0.3)]",
  "Poor":      "text-[var(--rose)] bg-[rgba(244,63,94,0.12)] border-[rgba(244,63,94,0.3)]",
};

const PLATFORM_COLORS: Record<string, string> = {
  "eBay":                "bg-[rgba(230,30,0,0.1)] text-[#e81e00] border-[rgba(230,30,0,0.2)]",
  "Poshmark":            "bg-[rgba(205,32,44,0.1)] text-[#cd202c] border-[rgba(205,32,44,0.2)]",
  "Vinted":              "bg-[rgba(9,182,111,0.1)] text-[#09b66f] border-[rgba(9,182,111,0.2)]",
  "Facebook Marketplace":"bg-[rgba(24,119,242,0.1)] text-[#1877f2] border-[rgba(24,119,242,0.2)]",
  "Etsy":                "bg-[rgba(235,88,40,0.1)] text-[#eb5828] border-[rgba(235,88,40,0.2)]",
  "Mercari":             "bg-[rgba(82,130,255,0.1)] text-[#5282ff] border-[rgba(82,130,255,0.2)]",
};

type ToneKey = "poshmark" | "ebay" | "etsy" | "facebook";

const TONE_LABELS: { key: ToneKey; label: string }[] = [
  { key: "poshmark", label: "Poshmark" },
  { key: "ebay",     label: "eBay" },
  { key: "etsy",     label: "Etsy" },
  { key: "facebook", label: "Facebook" },
];

interface ListingCardProps {
  result: ListingResult;
  index: number;
  onSave?: (result: ListingResult) => void;
}

export function ListingCard({ result, index, onSave }: ListingCardProps) {
  const [title, setTitle]             = useState(result.title);
  const [activeTone, setTone]         = useState<ToneKey>("poshmark");
  const [description, setDesc]        = useState(result.descriptions[activeTone]);
  const [copied, setCopied]           = useState(false);
  const [expanded, setExpanded]       = useState(true);
  const [templateSaved, setTplSaved]  = useState(false);
  const { save: saveTemplate }        = useTemplatesStore();

  const handleToneChange = (tone: ToneKey) => {
    setTone(tone);
    setDesc(result.descriptions[tone]);
  };

  const copyAll = async () => {
    const text = `${title}\n\n${description}\n\nPrice: $${result.priceRange.avg}\nCondition: ${result.condition}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveTemplate = () => {
    saveTemplate({
      name: `${result.category} — ${result.brand !== "Unknown" ? result.brand : result.condition}`,
      category: result.category,
      platform: result.platformRecommendation[0]?.platform ?? "eBay",
      titleHint: title.split(" ").slice(0, 4).join(" "),
    });
    setTplSaved(true);
    setTimeout(() => setTplSaved(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-5 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--violet-glow)] text-[var(--violet-light)] text-sm font-bold">
            {index + 1}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", CONDITION_COLORS[result.condition])}>
                {result.condition}
              </span>
              {result.brand !== "Unknown" && (
                <span className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-0.5 text-xs text-[var(--text-secondary)]">
                  {result.brand}
                </span>
              )}
              {result.flaggedForReview && (
                <span className="flex items-center gap-1 rounded-full border border-[rgba(245,158,11,0.4)] bg-[var(--amber-glow)] px-2 py-0.5 text-xs text-[var(--amber)]">
                  <AlertTriangle className="h-3 w-3" />
                  Review
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onSave && (
            <button
              onClick={() => onSave({ ...result, title })}
              aria-label="Save to Draft Vault"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--violet-light)] hover:bg-[var(--violet-glow)] transition-all"
            >
              <Bookmark className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <button
            onClick={handleSaveTemplate}
            aria-label={templateSaved ? "Template saved" : "Save as reusable template"}
            title="Save as template for future listings"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--amber)] hover:bg-[var(--amber-glow)] transition-all"
          >
            {templateSaved
              ? <CheckCircle className="h-4 w-4 text-[var(--emerald)]" aria-hidden="true" />
              : <LayoutTemplate className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button
            onClick={copyAll}
            aria-label={copied ? "Copied to clipboard" : "Copy listing to clipboard"}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-[var(--bg-elevated)] px-2.5 text-xs text-[var(--text-secondary)] hover:text-white hover:bg-[var(--violet)] transition-all"
          >
            {copied ? <CheckCircle className="h-3.5 w-3.5 text-[var(--emerald)]" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse listing" : "Expand listing"}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-white transition-all"
          >
            {expanded ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-4 px-5 pb-5">
          {/* Title */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              <Tag className="h-3 w-3" /> Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--violet)] focus:outline-none focus:ring-1 focus:ring-[var(--violet)] transition-all"
            />
            <p className="mt-1 text-right text-[10px] text-[var(--text-muted)]">{title.length}/80 chars</p>
          </div>

          {/* Tone Adaptor + Description */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                <Layers className="h-3 w-3" /> Description
              </label>
              <div className="flex overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]">
                {TONE_LABELS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handleToneChange(key)}
                    className={cn(
                      "px-2.5 py-1 text-xs font-medium transition-all",
                      activeTone === key
                        ? "bg-[var(--violet)] text-white"
                        : "text-[var(--text-secondary)] hover:text-white"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--violet)] focus:outline-none focus:ring-1 focus:ring-[var(--violet)] transition-all"
            />
          </div>

          {/* Price Range */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">Price Range</span>
            <div className="flex items-center gap-2">
              <span className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1 text-xs text-[var(--text-secondary)]">Low <strong className="text-[var(--text-primary)]">${result.priceRange.low}</strong></span>
              <span className="rounded-lg border border-[var(--violet)] bg-[var(--violet-glow)] px-2.5 py-1 text-xs font-semibold text-[var(--violet-light)]">Avg <strong>${result.priceRange.avg}</strong></span>
              <span className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1 text-xs text-[var(--text-secondary)]">High <strong className="text-[var(--text-primary)]">${result.priceRange.high}</strong></span>
            </div>
          </div>

          {/* Condition Notes */}
          {result.conditionNotes.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Condition Notes</p>
              <ul className="space-y-1">
                {result.conditionNotes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--amber)]" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Platform Recommendation */}
          <div>
            <p className="mb-2 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <Star className="h-3 w-3 text-[var(--amber)]" /> Best Platform
            </p>
            <div className="flex flex-wrap gap-2">
              {result.platformRecommendation.slice(0, 3).map((rec, i) => (
                <div
                  key={rec.platform}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
                    i === 0 ? PLATFORM_COLORS[rec.platform] : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
                  )}
                  title={rec.reason}
                >
                  {i === 0 && <Star className="h-3 w-3" />}
                  {rec.platform}
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-[var(--text-muted)] italic">
              {result.platformRecommendation[0]?.reason}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

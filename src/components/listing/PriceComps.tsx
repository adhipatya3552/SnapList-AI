"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ExternalLink, CheckCircle } from "lucide-react";
import type { PricingComps } from "@/lib/types";

interface PriceCompsProps {
  title: string;
  category: string;
  brand: string;
  condition: string;
  suggestedAvg: number;
  onSetPrice?: (price: number) => void;
}

export function PriceComps({
  title,
  category,
  brand,
  condition,
  suggestedAvg,
  onSetPrice,
}: PriceCompsProps) {
  const [data, setData] = useState<PricingComps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myPrice, setMyPrice] = useState<string>("");
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(
      `/api/price-comps?title=${encodeURIComponent(title)}&category=${encodeURIComponent(category)}&brand=${encodeURIComponent(brand)}&condition=${encodeURIComponent(condition)}`
    )
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? "Failed to fetch live pricing");
        }
        return payload as PricingComps;
      })
      .then((payload) => {
        setData(payload);
        setMyPrice(String(Math.round(suggestedAvg || payload.avg)));
        setLoading(false);
      })
      .catch((fetchError) => {
        setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch live pricing");
        setLoading(false);
      });
  }, [title, category, brand, condition, suggestedAvg]);

  const handleSetPrice = () => {
    const price = parseFloat(myPrice);
    if (!Number.isNaN(price) && price > 0 && onSetPrice) {
      onSetPrice(price);
      setApplied(true);
      setTimeout(() => setApplied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="skeleton h-4 w-40" />
        <div className="skeleton h-16 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[rgba(244,63,94,0.25)] bg-[rgba(244,63,94,0.06)] p-4 text-sm text-[var(--rose)]">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const max = Math.max(data.high * 1.1, 1);
  const platforms = data.platforms.slice(0, 4);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-[var(--emerald)]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Market Pricing Comps
        </span>
        <span className="ml-auto text-[10px] text-[var(--text-muted)]">
          {data.sampleSize} live market listings
        </span>
      </div>

      <div className="relative h-8 rounded-full bg-[var(--bg-card)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(data.high / max) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--violet)] to-[var(--amber)] opacity-30"
        />
        <motion.div
          initial={{ left: 0 }}
          animate={{ left: `${(data.low / max) * 100}%`, width: `${((data.high - data.low) / max) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-y-1 rounded-full bg-gradient-to-r from-[var(--violet)] to-[var(--amber)]"
        />
        <motion.div
          initial={{ left: 0 }}
          animate={{ left: `calc(${(data.avg / max) * 100}% - 1px)` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-y-0 w-0.5 rounded-full bg-white"
        />
      </div>

      <div className="flex items-center gap-3 text-sm">
        <div className="flex-1 text-center">
          <p className="text-[10px] text-[var(--text-muted)]">LOW</p>
          <p className="font-semibold text-[var(--text-secondary)]">${data.low}</p>
        </div>
        <div className="flex-1 rounded-lg border border-[var(--border-accent)] bg-[var(--violet-glow)] py-1 text-center">
          <p className="text-[10px] text-[var(--violet-light)]">AVG</p>
          <p className="font-bold text-[var(--violet-light)]">${data.avg}</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-[10px] text-[var(--text-muted)]">HIGH</p>
          <p className="font-semibold text-[var(--text-secondary)]">${data.high}</p>
        </div>
      </div>

      {onSetPrice && (
        <div className="flex items-center gap-2 border-t border-[var(--border)] pt-1">
          <label className="shrink-0 text-xs text-[var(--text-muted)]">My price</label>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">$</span>
            <input
              type="number"
              value={myPrice}
              onChange={(event) => setMyPrice(event.target.value)}
              aria-label="Set your listing price"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] py-1.5 pl-6 pr-2 text-sm text-[var(--text-primary)] transition-all focus:border-[var(--violet)] focus:outline-none focus:ring-1 focus:ring-[var(--violet)]"
            />
          </div>
          <button
            onClick={handleSetPrice}
            aria-label="Apply this price to your listing"
            className="shrink-0 rounded-lg bg-[var(--violet)] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[#6D28D9]"
          >
            {applied ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Applied!
              </span>
            ) : (
              "Set My Price ->"
            )}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {platforms.map((platform) => (
          <div key={platform.platform} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-xs text-[var(--text-secondary)]">{platform.platform}</span>
            <div className="h-1.5 flex-1 rounded-full bg-[var(--bg-card)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(platform.avgPrice / max) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full rounded-full bg-[var(--violet)]"
              />
            </div>
            <span className="w-10 text-right text-xs font-medium text-[var(--text-primary)]">
              ${platform.avgPrice}
            </span>
          </div>
        ))}
      </div>

      {data.comparables.length > 0 && (
        <div className="space-y-2 border-t border-[var(--border)] pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Live comparables
          </p>
          <div className="space-y-2">
            {data.comparables.slice(0, 4).map((item) => (
              <a
                key={item.itemId}
                href={item.itemWebUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-secondary)] transition-all hover:border-[var(--violet)] hover:text-[var(--text-primary)]"
              >
                <span className="line-clamp-2 flex-1">{item.title}</span>
                <span className="shrink-0 font-semibold text-[var(--text-primary)]">${item.price}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <p className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
        <ExternalLink className="h-3 w-3" />
        {data.notes[0] ?? "Live market comps are shown here."}
      </p>
    </div>
  );
}

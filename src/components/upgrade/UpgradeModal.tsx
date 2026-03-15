"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

// Build a DodoPayments checkout URL with redirect + clerk_id metadata
// clerk_id is used by the webhook handler to identify which user to upgrade
function checkoutUrl(base: string | undefined, plan: string, clerkId?: string | null): string {
  const fallback = "/pricing";
  if (!base) return fallback;
  const origin = window.location.origin;
  const returnUrl = `${origin}/payment-success?plan=${plan}`;
  const cancelUrl = `${origin}/pricing`;              // ← back button on checkout
  const sep = base.includes("?") ? "&" : "?";
  let url = `${base}${sep}redirect_url=${encodeURIComponent(returnUrl)}`;
  url += `&cancel_url=${encodeURIComponent(cancelUrl)}`;
  if (clerkId) url += `&metadata[clerk_id]=${encodeURIComponent(clerkId)}`;
  return url;
}

const PLAN_CONFIGS = [
  {
    name:     "Hustler",
    planKey:  "hustler",
    price:    12,
    listings: "100",
    features: ["All platforms", "Live pricing comps", "Batch mode (5)"],
    highlight: false,
    envKey:   "NEXT_PUBLIC_DODO_HUSTLER_LINK",
  },
  {
    name:     "Flipper",
    planKey:  "flipper",
    price:    24,
    listings: "500",
    features: ["All platforms", "Live pricing comps", "Batch mode (10)", "Platform router"],
    highlight: true,
    envKey:   "NEXT_PUBLIC_DODO_FLIPPER_LINK",
  },
  {
    name:     "Pro",
    planKey:  "pro",
    price:    49,
    listings: "∞",
    features: ["Everything", "Priority support", "Team seats", "API access"],
    highlight: false,
    envKey:   "NEXT_PUBLIC_DODO_PRO_LINK",
  },
];

// Read env vars (NEXT_PUBLIC_ vars are inlined by Next.js at build time)
const ENV: Record<string, string | undefined> = {
  hustler: process.env.NEXT_PUBLIC_DODO_HUSTLER_LINK,
  flipper: process.env.NEXT_PUBLIC_DODO_FLIPPER_LINK,
  pro:     process.env.NEXT_PUBLIC_DODO_PRO_LINK,
};

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const { user } = useUser();
  const clerkId = user?.id;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card w-full max-w-2xl p-6"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">You&apos;ve used all your free listings</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Upgrade to keep listing. Cancel anytime.</p>
              </div>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {PLAN_CONFIGS.map((plan) => (
                <div
                  key={plan.name}
                  className={cn(
                    "rounded-xl border p-4 space-y-4 transition-all",
                    plan.highlight
                      ? "border-[var(--violet)] bg-[var(--violet-glow)] glow-violet"
                      : "border-[var(--border)] bg-[var(--bg-elevated)]"
                  )}
                >
                  {plan.highlight && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--violet)] px-2 py-0.5 text-[10px] font-semibold text-white uppercase">
                      <Zap className="h-2.5 w-2.5" /> Popular
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{plan.name}</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      ${plan.price}<span className="text-sm font-normal text-[var(--text-muted)]">/mo</span>
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">{plan.listings} listings/month</p>
                  </div>
                  <ul className="space-y-1.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                        <Check className="h-3 w-3 text-[var(--emerald)] flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      onClose();
                      const url = checkoutUrl(ENV[plan.planKey], plan.planKey, clerkId);
                      window.location.href = url;
                    }}
                    className={cn(
                      "w-full rounded-lg py-2 text-sm font-semibold transition-all",
                      plan.highlight
                        ? "bg-[var(--violet)] text-white hover:bg-[#6D28D9]"
                        : "border border-[var(--border)] bg-transparent text-[var(--text-primary)] hover:border-[var(--violet)] hover:text-[var(--violet-light)]"
                    )}
                  >
                    Get {plan.name}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

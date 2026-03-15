"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Zap } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useCreditsStore } from "@/store/credits";
import { BackButton } from "@/components/ui/BackButton";

const DODO_LINKS: Record<string, string | undefined> = {
  hustler: process.env.NEXT_PUBLIC_DODO_HUSTLER_LINK,
  flipper: process.env.NEXT_PUBLIC_DODO_FLIPPER_LINK,
  pro:     process.env.NEXT_PUBLIC_DODO_PRO_LINK,
};

function goToCheckout(planKey: string, clerkId?: string | null) {
  const base = DODO_LINKS[planKey];
  if (!base) return;
  const origin = window.location.origin;
  const returnUrl = `${origin}/payment-success?plan=${planKey}`;
  const cancelUrl = `${origin}/pricing`;              // ← back button on checkout
  const sep = base.includes("?") ? "&" : "?";
  let url = `${base}${sep}redirect_url=${encodeURIComponent(returnUrl)}`;
  url += `&cancel_url=${encodeURIComponent(cancelUrl)}`;
  if (clerkId) url += `&metadata[clerk_id]=${encodeURIComponent(clerkId)}`;
  window.location.href = url;
}

const PLANS = [
  {
    name: "Free",
    planKey: "",
    price: 0,
    listings: "10",
    features: ["AI title & description", "Condition assessment", "Basic platform pick", "2 platforms"],
    highlight: false,
    cta: "Current Plan",
    ctaDisabled: true,
  },
  {
    name: "Hustler",
    planKey: "hustler",
    price: 12,
    listings: "100",
    features: ["Everything in Free", "Live pricing comps", "All 6 platforms", "Tone adaptor", "Batch mode (5 items)"],
    highlight: false,
    cta: "Get Hustler",
    ctaDisabled: false,
  },
  {
    name: "Flipper",
    planKey: "flipper",
    price: 24,
    listings: "500",
    features: ["Everything in Hustler", "Batch mode (10 items)", "Platform router AI", "Priority support", "Draft Vault templates"],
    highlight: true,
    cta: "Get Flipper",
    ctaDisabled: false,
  },
  {
    name: "Pro",
    planKey: "pro",
    price: 49,
    listings: "∞",
    features: ["Everything in Flipper", "Unlimited listings", "Full API access", "Team seats", "Analytics dashboard"],
    highlight: false,
    cta: "Get Pro",
    ctaDisabled: false,
  },
];

export default function PricingPage() {
  const { user } = useUser();
  const clerkId = user?.id;
  const { plan: currentPlan } = useCreditsStore();

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-10">
        {/* Back button */}
        <div>
          <BackButton fallback="/analyze" label="Back" />
        </div>

        <div className="text-center space-y-3">
          <h1 className="text-3xl font-black text-[var(--text-primary)]">
            Simple, <span className="gradient-text">reseller-fair</span> pricing
          </h1>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
            Vendoo charges $30/mo for 250 listings. We charge $24 for 500. No listing caps on Pro.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative rounded-2xl border p-5 flex flex-col gap-5",
                plan.highlight
                  ? "border-[var(--violet)] bg-gradient-to-b from-[var(--violet-glow)] to-[var(--bg-surface)] glow-violet"
                  : "border-[var(--border)] bg-[var(--bg-surface)]"
              )}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-[var(--violet)] px-3 py-0.5 text-[11px] font-bold text-white uppercase">
                  <Zap className="h-3 w-3" /> Most Popular
                </span>
              )}

              <div>
                <p className="text-sm font-semibold text-[var(--text-secondary)]">{plan.name}</p>
                <p className="text-3xl font-black text-[var(--text-primary)] mt-1">
                  {plan.price === 0 ? "Free" : `$${plan.price}`}
                  {plan.price > 0 && <span className="text-base font-normal text-[var(--text-muted)]">/mo</span>}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{plan.listings} listings/month</p>
              </div>

              <ul className="flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                    <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[var(--emerald)]" />
                    {f}
                  </li>
                ))}
              </ul>

              {(() => {
                const planId = plan.planKey || "free";
                const isCurrent = currentPlan === planId;
                const isDisabled = isCurrent || plan.ctaDisabled;
                return (
                  <button
                    disabled={isDisabled}
                    onClick={() => !isCurrent && goToCheckout(plan.planKey, clerkId)}
                    className={cn(
                      "w-full rounded-xl py-2.5 text-sm font-semibold transition-all",
                      isCurrent
                        ? "border border-[var(--emerald)] text-[var(--emerald)] cursor-default opacity-90 bg-[rgba(16,185,129,0.08)]"
                        : plan.highlight
                          ? "bg-[var(--violet)] text-white hover:bg-[#6D28D9] shadow-lg shadow-[var(--violet-glow)]"
                          : "border border-[var(--border)] bg-transparent text-[var(--text-primary)] hover:border-[var(--violet)] hover:text-[var(--violet-light)]"
                    )}
                  >
                    {isCurrent ? "✓ Current Plan" : plan.cta}
                  </button>
                );
              })()}
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)] text-center">Common questions</h2>
          {[
            { q: "Will eBay or Poshmark make this obsolete?", a: "Platform-native AI tools are siloed — they'll never recommend competitors. Our moat is neutrality. We solve cross-platform problems no single marketplace can." },
            { q: "Does it work for all product categories?", a: "Yes — clothing, shoes, electronics, books, kitchen appliances, collectibles, and more. The AI is tuned for resale market pricing and descriptions." },
            { q: "Can I cancel anytime?", a: "Absolutely. Monthly billing, no contracts. Cancel from your account settings and you keep access until the end of the billing period." },
          ].map(({ q, a }) => (
            <div key={q} className="glass-card p-4">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{q}</p>
              <p className="mt-1.5 text-sm text-[var(--text-secondary)]">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

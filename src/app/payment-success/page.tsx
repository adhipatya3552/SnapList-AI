"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Zap, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useCreditsStore } from "@/store/credits";
import type { Plan } from "@/lib/types";
import { BackButton } from "@/components/ui/BackButton";

const PLAN_DETAILS: Record<string, { label: string; listings: string; color: string }> = {
  hustler: { label: "Hustler",  listings: "100",  color: "from-[var(--violet)] to-[#9333EA]" },
  flipper: { label: "Flipper",  listings: "500",  color: "from-[var(--violet)] to-[var(--amber)]" },
  pro:     { label: "Pro",      listings: "∞",    color: "from-[var(--amber)] to-[#F97316]" },
};

const CREDIT_LIMITS: Record<string, number> = {
  hustler: 100,
  flipper: 500,
  pro:     999999,
};

export default function PaymentSuccessPage() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const { user }      = useUser();
  const { upgrade }   = useCreditsStore();
  const [done, setDone] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upgradePlanInDB = useMutation("users:upgradePlan" as any);

  const planKey = (searchParams.get("plan") ?? "hustler").toLowerCase() as Plan;
  const plan    = PLAN_DETAILS[planKey] ?? PLAN_DETAILS.hustler;

  // Effect 1: Immediately upgrade local Zustand store for instant UI feedback
  useEffect(() => {
    upgrade(planKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount only

  // Effect 2: Write to Convex DB once user is loaded
  // This ensures SyncUserWithConvex won't revert us, even without webhook firing
  useEffect(() => {
    if (!user?.id || done) return;
    upgradePlanInDB({
      clerkId: user.id,
      plan: planKey,
    })
      .then(() => setDone(true))
      .catch((err) => { console.error("[payment-success] DB upgrade failed:", err); setDone(true); });
  }, [user?.id, done, planKey, upgradePlanInDB]);


  // Auto-redirect to analyze after 5 seconds
  useEffect(() => {
    const t = setTimeout(() => router.push("/analyze"), 5000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-base)] px-4 text-center">
      {/* Back button — top-left */}
      <div className="fixed top-5 left-5 z-20">
        <BackButton fallback="/pricing" label="Back to Pricing" />
      </div>

      {/* Confetti-style glow blobs */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-[var(--violet)] opacity-10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 left-1/3 h-48 w-48 rounded-full bg-[var(--amber)] opacity-10 blur-3xl" />


      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
        className="relative z-10 space-y-8 max-w-md"
      >
        {/* Big check icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 12 }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[var(--emerald)] to-[#059669] shadow-2xl shadow-[rgba(16,185,129,0.3)]"
        >
          <CheckCircle className="h-12 w-12 text-white" />
        </motion.div>

        {/* Headline */}
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <span className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${plan.color} px-4 py-1.5 text-sm font-bold text-white shadow-lg`}>
              <Zap className="h-4 w-4" />
              {plan.label} Plan Activated!
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="text-3xl font-black text-[var(--text-primary)]"
          >
            Welcome to{" "}
            <span className="gradient-text">{plan.label}!</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="text-[var(--text-secondary)]"
          >
            You now have <strong className="text-[var(--text-primary)]">{plan.listings} AI listings per month</strong>.
            Start generating right away — no setup needed.
          </motion.p>
        </div>

        {/* What you unlocked */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="glass-card p-5 text-left space-y-3"
        >
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[var(--amber)]" />
            Unlocked for you
          </p>
          <ul className="space-y-2">
            {[
              `${plan.listings} AI listings/month`,
              "Live Google Shopping pricing comps with clickable comparables",
              "Platform Router — best marketplace recommendation",
              "Tone Adaptor — Poshmark, eBay, Etsy, Facebook styles",
              "Batch mode — analyze up to 10 items at once",
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--emerald)]" />
                {feature}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="space-y-3"
        >
          <Link href="/analyze">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--violet)] to-[#9333EA] py-4 font-bold text-white shadow-xl shadow-[var(--violet-glow)] hover:shadow-2xl transition-all"
            >
              <Zap className="h-5 w-5" />
              Start Analyzing Now
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </Link>
          <p className="text-xs text-[var(--text-muted)]">
            Redirecting you automatically in 5 seconds…
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

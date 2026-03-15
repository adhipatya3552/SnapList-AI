"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Camera, Zap, TrendingUp, Layers, Star, ArrowRight,
  BarChart2, RefreshCw, ShieldCheck, LayoutDashboard
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

const FEATURES = [
  {
    icon: Camera,
    title: "Photo → Listing in 10s",
    desc: "Drag a photo and get a publish-ready listing with SEO title, description, condition grade, and pricing comps.",
    color: "var(--violet)",
  },
  {
    icon: TrendingUp,
    title: "Live Pricing Comps",
    desc: "Shows live Google Shopping market comps and direct comparable listings so you can price from real inventory, not guesswork.",
    color: "var(--amber)",
  },
  {
    icon: ArrowRight,
    title: "Platform Router",
    desc: "Ranks the best marketplace for your item using category fit, brand signals, condition, and live market comps.",
    color: "var(--emerald)",
  },
  {
    icon: Layers,
    title: "Tone Adaptor",
    desc: "One listing, rewritten for each platform automatically: casual Poshmark, SEO-dense eBay, narrative Etsy.",
    color: "var(--violet-light)",
  },
  {
    icon: Camera,
    title: "Batch Mode",
    desc: "Upload 10 photos at once and generate all 10 draft listings before you leave the thrift store.",
    color: "var(--amber)",
  },
  {
    icon: Star,
    title: "Listing Report Card",
    desc: "Paste any existing listing and get an AI quality score — see exactly what you're leaving on the table.",
    color: "var(--rose)",
  },
];

const STATS = [
  { value: "8s", label: "Avg. listing time" },
  { value: "6–12 hrs", label: "Saved per month" },
  { value: "90%+", label: "Item ID accuracy" },
  { value: "$24/mo", label: "500 listings — vs. $30 at Vendoo" },
];

export default function LandingPage() {
  const { user, isLoaded } = useUser();
  const isSignedIn = isLoaded && !!user;

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg-base)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--violet)] to-[#9333EA]">
              <Camera className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold gradient-text">SnapList AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="text-sm text-[var(--text-secondary)] hover:text-white transition-colors">Pricing</Link>
            {isSignedIn ? (
              /* Logged-in: show Go to Dashboard instead of Sign In */
              <Link href="/analyze">
                <button className="flex items-center gap-2 rounded-lg bg-[var(--violet)] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#6D28D9] transition-all">
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </button>
              </Link>
            ) : (
              /* Not logged in: show Sign In + Get Started */
              <>
                <Link href="/sign-in">
                  <button className="rounded-lg border border-[var(--border)] bg-transparent px-4 py-1.5 text-sm text-[var(--text-primary)] hover:border-[var(--violet)] hover:text-[var(--violet-light)] transition-all">
                    Sign In
                  </button>
                </Link>
                <Link href="/sign-up">
                  <button className="rounded-lg bg-[var(--violet)] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#6D28D9] transition-all">
                    Get Started Free
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 text-center">
        {/* Glow blobs */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[var(--violet)] opacity-10 blur-3xl" />
        <div className="pointer-events-none absolute top-20 right-1/4 h-64 w-64 rounded-full bg-[var(--amber)] opacity-8 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-3xl space-y-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[var(--violet-glow)] px-4 py-1 text-xs font-semibold text-[var(--violet-light)] uppercase tracking-wider">
            <Zap className="h-3 w-3" />
            Platform-agnostic AI listing tool
          </span>

          <h1 className="text-5xl font-black leading-tight text-[var(--text-primary)] sm:text-6xl">
            Snap a photo.<br />
            <span className="gradient-text">Get a listing in 10 seconds.</span>
          </h1>

          <p className="mx-auto max-w-xl text-lg text-[var(--text-secondary)]">
            AI-generated title, SEO description, condition grade, pricing comps, and platform recommendation — for eBay, Poshmark, Etsy, Vinted, and more. All from one photo.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/sign-up">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--violet)] to-[#9333EA] px-8 py-4 text-base font-bold text-white shadow-xl shadow-[var(--violet-glow)] hover:shadow-2xl transition-all"
              >
                Start Free — No Card Required
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </Link>
            <Link href="/report-card">
              <button className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-transparent px-6 py-4 text-sm text-[var(--text-secondary)] hover:border-[var(--violet)] hover:text-white transition-all">
                <Star className="h-4 w-4 text-[var(--amber)]" />
                Grade my existing listing
              </button>
            </Link>
          </div>

          <p className="text-xs text-[var(--text-muted)]">10 free AI listings/month. No credit card needed.</p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-[var(--border)] bg-[var(--bg-surface)] py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 px-4 sm:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-2xl font-black gradient-text">{stat.value}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black text-[var(--text-primary)]">
              Everything a reseller actually needs
            </h2>
            <p className="mt-2 text-[var(--text-secondary)]">
              Not just a listing generator. The intelligence layer every reseller needs.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-5 space-y-3 hover:border-[var(--border-accent)] transition-all group"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                  style={{ background: `color-mix(in srgb, ${feat.color} 20%, transparent)` }}
                >
                  <feat.icon className="h-5 w-5" style={{ color: feat.color }} />
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">{feat.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vs Competitors */}
      <section className="bg-[var(--bg-surface)] border-y border-[var(--border)] px-4 py-16">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">
            Why not just use Vendoo or Poshmark Smart List?
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-left">
            {[
              { name: "Poshmark Smart List", problem: "Locked to one platform. No pricing intelligence." },
              { name: "Vendoo", problem: "$30/mo for 250 listings. Weak AI, no platform routing." },
              { name: "Reeva", problem: "Reported accuracy errors, no pricing comps, new & unproven." },
            ].map((comp) => (
              <div key={comp.name} className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-4 w-4 text-[var(--rose)]" />
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{comp.name}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">{comp.problem}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            SnapList AI is <strong className="text-[var(--text-primary)]">platform-neutral</strong>. We&apos;re the only tool that tells you <em>where</em> to list and <em>for how much</em> — across all platforms simultaneously.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-xl space-y-6"
        >
          <h2 className="text-3xl font-black text-[var(--text-primary)]">
            Stop losing 6 hours a month to writing listings.
          </h2>
          <Link href="/sign-up">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--violet)] to-[#9333EA] px-10 py-4 text-base font-bold text-white shadow-xl shadow-[var(--violet-glow)] hover:shadow-2xl transition-all"
            >
              <BarChart2 className="h-5 w-5" />
              Get 10 Free Listings — No Card Required
            </motion.button>
          </Link>
          <p className="text-xs text-[var(--text-muted)]">
            Free forever. Upgrade when you need more.
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--violet)] to-[#9333EA]">
              <Camera className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold gradient-text">SnapList AI</span>
          </div>
          <div className="flex gap-6 text-xs text-[var(--text-muted)]">
            <Link href="/pricing" className="hover:text-[var(--text-secondary)] transition-colors">Pricing</Link>
            <Link href="/report-card" className="hover:text-[var(--text-secondary)] transition-colors">Report Card</Link>
            <Link href="/privacy-policy" className="hover:text-[var(--text-secondary)] transition-colors">Privacy Policy</Link>
          </div>
          <p className="text-xs text-[var(--text-muted)]">© 2025 SnapList AI. Built for resellers.</p>
        </div>
      </footer>
    </div>
  );
}

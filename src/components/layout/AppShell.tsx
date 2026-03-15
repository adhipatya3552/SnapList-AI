"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, Bookmark, Star, CreditCard, Zap, Menu, X } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useCreditsStore } from "@/store/credits";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV = [
  { href: "/analyze", label: "Analyze",     icon: Camera },
  { href: "/vault",   label: "Draft Vault",  icon: Bookmark },
  { href: "/report-card", label: "Report Card", icon: Star },
  { href: "/pricing", label: "Pricing",      icon: CreditCard },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { used, limit, plan } = useCreditsStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pct = Math.min(100, (used / (limit === Infinity ? 1 : limit)) * 100);

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-56 flex-shrink-0 flex flex-col border-r border-[var(--border)] bg-[var(--bg-surface)] transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo — click to return to landing page */}
        <Link href="/" className="flex h-16 items-center gap-2 px-5 border-b border-[var(--border)] hover:opacity-80 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--violet)] to-[#9333EA]">
            <Camera className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold gradient-text">SnapList AI</span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Main navigation">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href} href={href}
                onClick={() => setMobileOpen(false)}
                aria-current={active ? "page" : undefined}
              >
                <motion.div
                  whileHover={{ x: 2 }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-[var(--violet-glow)] text-[var(--violet-light)] border border-[var(--border-accent)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Credits */}
        <div className="border-t border-[var(--border)] p-4 space-y-3">
          {plan === "free" && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">Free listings</span>
                <span className="font-semibold text-[var(--text-secondary)]">{used}/{limit}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[var(--bg-card)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  className={cn("h-full rounded-full transition-all", pct > 80 ? "bg-[var(--rose)]" : "bg-[var(--violet)]")}
                />
              </div>
              <Link href="/pricing">
                <div className="flex items-center gap-1 text-[10px] text-[var(--violet-light)] hover:text-[var(--amber)] transition-colors cursor-pointer">
                  <Zap className="h-3 w-3" />
                  Upgrade for more →
                </div>
              </Link>
            </div>
          )}
          <div className="flex items-center gap-2">
            <UserButton afterSignOutUrl="/" />
            <span className="text-xs text-[var(--text-muted)] capitalize">{plan} plan</span>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col lg:pl-56">
        {/* Mobile header */}
        <header className="flex h-14 items-center gap-3 border-b border-[var(--border)] bg-[var(--bg-surface)] px-4 lg:hidden">
          <button onClick={() => setMobileOpen((o) => !o)} className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-white">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="text-sm font-bold gradient-text">SnapList AI</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

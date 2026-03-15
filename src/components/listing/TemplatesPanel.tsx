"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutTemplate, X, ChevronDown, ChevronUp } from "lucide-react";
import { useTemplatesStore, type ListingTemplate } from "@/store/templates";

interface TemplatesPanelProps {
  onApply: (template: ListingTemplate) => void;
}

export function TemplatesPanel({ onApply }: TemplatesPanelProps) {
  const { templates, remove } = useTemplatesStore();
  const [open, setOpen] = useState(false);

  if (templates.length === 0) return null;

  return (
    <div className="glass-card overflow-hidden" aria-label="Saved listing templates">
      {/* Header / toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        aria-expanded={open}
        aria-controls="templates-list"
      >
        <span className="flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4 text-[var(--amber)]" aria-hidden="true" />
          Saved Templates
          <span className="rounded-full bg-[var(--amber-glow)] px-2 py-0.5 text-[10px] font-semibold text-[var(--amber)]">
            {templates.length}
          </span>
        </span>
        {open
          ? <ChevronUp className="h-4 w-4" aria-hidden="true" />
          : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="templates-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[var(--border)] px-4 pb-4"
          >
            <p className="py-2 text-[11px] text-[var(--text-muted)]">
              Click a template to guide your next analysis with saved category, title, and platform context.
            </p>
            <ul className="space-y-2" role="list">
              {templates.map((tpl) => (
                <li
                  key={tpl.id}
                  className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2"
                >
                  <button
                    onClick={() => onApply(tpl)}
                    className="flex-1 text-left"
                    aria-label={`Apply template: ${tpl.name}`}
                  >
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{tpl.name}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {tpl.category} · Best on <span className="text-[var(--violet-light)]">{tpl.platform}</span>
                    </p>
                  </button>
                  <button
                    onClick={() => remove(tpl.id)}
                    aria-label={`Delete template ${tpl.name}`}
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[rgba(244,63,94,0.15)] hover:text-[var(--rose)] transition-all"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

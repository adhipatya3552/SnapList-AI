import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DraftListing, ListingResult, Platform } from "@/lib/types";
import { randomUUID } from "crypto";

interface DraftsState {
  drafts: DraftListing[];
  add: (listing: ListingResult, userPrice?: number, selectedPlatform?: Platform) => string;
  update: (id: string, patch: Partial<DraftListing>) => void;
  remove: (id: string) => void;
  clear: () => void;
}

// Use a client-safe uuid fallback
function uuid() {
  if (typeof window !== "undefined" && window.crypto) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useDraftsStore = create<DraftsState>()(
  persist(
    (set) => ({
      drafts: [],
      add: (listing, userPrice, selectedPlatform) => {
        const id = uuid();
        set((s) => ({
          drafts: [{ id, listing, savedAt: Date.now(), userPrice, selectedPlatform }, ...s.drafts],
        }));
        return id;
      },
      update: (id, patch) =>
        set((s) => ({
          drafts: s.drafts.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        })),
      remove: (id) => set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) })),
      clear: () => set({ drafts: [] }),
    }),
    { name: "snaplist-drafts" }
  )
);

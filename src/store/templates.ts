import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ListingTemplate {
  id: string;
  name: string;           // e.g. "Nike Sneakers"
  category: string;       // e.g. "Sneakers"
  platform: string;       // e.g. "eBay"
  titleHint: string;      // partial title prefix to pre-fill
  savedAt: number;
}

interface TemplatesState {
  templates: ListingTemplate[];
  save: (t: Omit<ListingTemplate, "id" | "savedAt">) => void;
  remove: (id: string) => void;
}

export const useTemplatesStore = create<TemplatesState>()(
  persist(
    (set, get) => ({
      templates: [],
      save: (t) => {
        const id = `tpl_${Date.now()}`;
        set({ templates: [{ ...t, id, savedAt: Date.now() }, ...get().templates] });
      },
      remove: (id) => set({ templates: get().templates.filter((t) => t.id !== id) }),
    }),
    { name: "snaplist-templates" }
  )
);

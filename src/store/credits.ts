import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Plan, UserCredits } from "@/lib/types";
import { PLAN_LIMITS } from "@/lib/types";

interface CreditsState extends UserCredits {
  consume: () => boolean; // returns false if at limit
  upgrade: (plan: Plan) => void;
  reset: () => void; // for dev/testing
}

export const useCreditsStore = create<CreditsState>()(
  persist(
    (set, get) => ({
      used:  0,
      limit: PLAN_LIMITS.free,
      plan:  "free" as Plan,
      consume: () => {
        const { used, limit } = get();
        if (used >= limit) return false;
        set({ used: used + 1 });
        return true;
      },
      upgrade: (plan: Plan) => set({ plan, limit: PLAN_LIMITS[plan] }),
      reset: () => set({ used: 0 }),
    }),
    { name: "snaplist-credits" }
  )
);

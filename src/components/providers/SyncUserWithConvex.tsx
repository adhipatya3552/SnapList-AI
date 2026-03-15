"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useCreditsStore } from "@/store/credits";

export function SyncUserWithConvex() {
  const { user, isLoaded } = useUser();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getOrCreate = useMutation("users:getOrCreate" as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbUser = useQuery("users:getByClerkId" as any, user?.id ? { clerkId: user.id } : "skip");
  const setStoreState = useCreditsStore((s) => s.upgrade);

  // 1. Ensure user exists in Convex DB
  useEffect(() => {
    if (isLoaded && user) {
      getOrCreate({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
      }).catch(console.error);
    }
  }, [isLoaded, user, getOrCreate]);

  // 2. Sync DB plan → local Zustand store (hierarchy-aware — never downgrade)
  useEffect(() => {
    if (!dbUser?.plan) return;

    // Plan ranking: higher = better
    const rank: Record<string, number> = { free: 0, hustler: 1, flipper: 2, pro: 3 };
    const dbRank    = rank[dbUser.plan]                              ?? 0;
    const localRank = rank[useCreditsStore.getState().plan as string] ?? 0;

    if (dbRank > localRank) {
      // DB has a higher plan (e.g., webhook already fired) — upgrade local
      setStoreState(dbUser.plan as any);
      useCreditsStore.setState({ used: dbUser.creditsUsed, limit: dbUser.creditLimit });
    } else if (dbRank === localRank) {
      // Same plan level — just sync usage numbers (credits consumed across devices)
      useCreditsStore.setState({ used: dbUser.creditsUsed, limit: dbUser.creditLimit });
    }
    // dbRank < localRank → user just paid, webhook hasn't fired yet.
    // Keep the local optimistic state from /payment-success — do NOT overwrite.
  }, [dbUser, setStoreState]);

  return null;
}

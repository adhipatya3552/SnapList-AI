"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// Gracefully handle missing Convex URL — allows pages to render without
// Convex configured (before running `npx convex dev`).
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

import { SyncUserWithConvex } from "./SyncUserWithConvex";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    // No Convex URL set — render children without Convex context
    // This allows the UI to work in demo mode (drafts/credits use localStorage)
    return <>{children}</>;
  }
  return (
    <ConvexProvider client={convex}>
      <SyncUserWithConvex />
      {children}
    </ConvexProvider>
  );
}

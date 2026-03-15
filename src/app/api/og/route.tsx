import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const score = Number(searchParams.get("score") ?? "0");
  const grade = searchParams.get("grade") ?? "F";
  const title = searchParams.get("title") ?? "My Listing";
  const tk    = Number(searchParams.get("tk") ?? "0");    // titleKeywords
  const dq    = Number(searchParams.get("dq") ?? "0");    // descriptionQuality
  const pm    = Number(searchParams.get("pm") ?? "0");    // priceVsMarket
  const pf    = Number(searchParams.get("pf") ?? "0");    // platformFit

  // Grade color
  const gradeColor =
    grade === "A" ? "#10B981" :
    grade === "B" ? "#FCD34D" :
    grade === "C" ? "#F59E0B" :
    grade === "D" ? "#FB923C" : "#F43F5E";

  const BarRow = ({ label, val }: { label: string; val: number }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
      <span style={{ width: 180, fontSize: 14, color: "#94A3B8", flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 8, background: "#1E293B", borderRadius: 4, display: "flex" }}>
        <div
          style={{
            width: `${(val / 25) * 100}%`,
            height: "100%",
            borderRadius: 4,
            background: val >= 20 ? "#10B981" : val >= 12 ? "#F59E0B" : "#F43F5E",
          }}
        />
      </div>
      <span style={{ width: 40, fontSize: 14, color: "#E2E8F0", textAlign: "right" }}>{val}/25</span>
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: 800,
          height: 400,
          background: "linear-gradient(135deg, #0F0D1A 0%, #1A0F2E 100%)",
          display: "flex",
          flexDirection: "column",
          padding: "40px 48px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontSize: 16 }}>📸</span>
            </div>
            <span style={{ color: "#A78BFA", fontWeight: 700, fontSize: 18 }}>SnapList AI</span>
          </div>
          <span style={{ color: "#64748B", fontSize: 12 }}>Listing Report Card</span>
        </div>

        {/* Title */}
        <p style={{ color: "#94A3B8", fontSize: 13, margin: "0 0 16px", maxWidth: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {title.length > 60 ? title.slice(0, 60) + "…" : title}
        </p>

        {/* Main content */}
        <div style={{ display: "flex", gap: 40, flex: 1 }}>
          {/* Grade circle */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                border: `4px solid ${gradeColor}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: `${gradeColor}15`,
              }}
            >
              <span style={{ fontSize: 52, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{grade}</span>
            </div>
            <span style={{ color: "#E2E8F0", fontSize: 28, fontWeight: 900 }}>
              {score}<span style={{ fontSize: 14, color: "#64748B", fontWeight: 400 }}>/100</span>
            </span>
          </div>

          {/* Breakdown bars */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
            <BarRow label="Title Keywords" val={tk} />
            <BarRow label="Description Quality" val={dq} />
            <BarRow label="Price vs. Market" val={pm} />
            <BarRow label="Platform Fit" val={pf} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <span style={{ color: "#4C1D95", fontSize: 11 }}>snaplist.ai · Grade your listing for free</span>
        </div>
      </div>
    ),
    { width: 800, height: 400 }
  );
}

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — SnapList AI",
  description: "How SnapList AI collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: "1. Information We Collect",
      content: [
        "**Account information:** When you sign up, we collect your email address and name via Clerk (our authentication provider).",
        "**Product images:** Photos you upload for AI analysis are processed in memory and are not stored permanently unless you explicitly save a draft.",
        "**Usage data:** We collect anonymized analytics such as number of listings generated and features used to improve the product.",
        "**Payment information:** Payments are processed by DodoPayments. We never store your card details — only your subscription plan and status.",
      ],
    },
    {
      title: "2. How We Use Your Information",
      content: [
        "To generate AI-powered product listings from your uploaded photos.",
        "To manage your account, subscription plan, and credit limits.",
        "To send transactional emails (e.g., payment receipts) — no marketing emails without your consent.",
        "To improve SnapList AI's features based on anonymized usage patterns.",
      ],
    },
    {
      title: "3. Data Sharing",
      content: [
        "**We do not sell your personal data** to third parties.",
        "We share data only with trusted service providers required to operate the platform: Clerk (authentication), Convex (database), OpenRouter (AI processing), and DodoPayments (billing).",
        "Each provider is contractually bound to protect your data and use it only to provide their specific service.",
      ],
    },
    {
      title: "4. Data Retention",
      content: [
        "Account data is retained for as long as your account is active.",
        "Draft listings are retained until you delete them.",
        "Uploaded images used for analysis are not stored beyond the immediate API call.",
        "You can request deletion of your account and all associated data at any time by contacting us.",
      ],
    },
    {
      title: "5. Security",
      content: [
        "All data is transmitted over HTTPS/TLS.",
        "Authentication is handled by Clerk, which uses industry-standard security practices.",
        "We do not store passwords — authentication is managed entirely by Clerk.",
      ],
    },
    {
      title: "6. Your Rights",
      content: [
        "**Access:** You can view your account data at any time through your account settings.",
        "**Correction:** You can update your profile information through Clerk's user portal.",
        "**Deletion:** You can delete your account and request removal of all your data by contacting support.",
        "**Portability:** You can export your saved drafts as CSV from the Draft Vault page.",
      ],
    },
    {
      title: "7. Cookies",
      content: [
        "We use only essential cookies necessary for authentication (session cookies managed by Clerk).",
        "We do not use tracking or advertising cookies.",
      ],
    },
    {
      title: "8. Changes to This Policy",
      content: [
        "We may update this Privacy Policy from time to time. Material changes will be communicated via email or an in-app notice.",
        "Continued use of SnapList AI after changes take effect constitutes acceptance of the updated policy.",
      ],
    },
    {
      title: "9. Contact",
      content: [
        "If you have questions about this Privacy Policy or want to exercise your rights, please contact us at: **support@snaplist.ai**",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Back button */}
      <div className="fixed top-5 left-5 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to app
        </Link>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-20">
        {/* Header */}
        <div className="mb-12 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--violet)] to-[#9333EA]">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">SnapList AI</span>
          </div>
          <h1 className="text-4xl font-black">Privacy Policy</h1>
          <p className="text-[var(--text-secondary)]">
            Last updated: <span className="font-medium text-[var(--text-primary)]">March 2025</span>
          </p>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            SnapList AI (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your privacy.
            This policy explains what data we collect, why we collect it, and how we use it.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 text-lg font-bold text-[var(--text-primary)]">{section.title}</h2>
              <ul className="space-y-2">
                {section.content.map((item, i) => (
                  <li
                    key={i}
                    className="text-[var(--text-secondary)] leading-relaxed text-sm pl-4 border-l border-[var(--border)]"
                    dangerouslySetInnerHTML={{
                      __html: item.replace(/\*\*(.*?)\*\*/g, "<strong class=\"text-[var(--text-primary)]\">$1</strong>"),
                    }}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-[var(--border)] text-center text-xs text-[var(--text-muted)]">
          © {new Date().getFullYear()} SnapList AI. All rights reserved.
        </div>
      </div>
    </div>
  );
}

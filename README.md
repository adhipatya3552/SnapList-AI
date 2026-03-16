# 📸 SnapList AI
## 🤖 Project Overview

**SnapList AI** is an AI-powered, multimodal product listing generator built with **Next.js**, **TypeScript**, **Convex**, and **Tailwind CSS**. It allows resellers to simply upload or photograph an item and receive a fully optimized, platform-ready listing — including a compelling title, SEO-rich description, competitive price range, condition assessment, and a smart recommendation for the best marketplace to sell on. The platform supports subscription-based access via **DodoPayments**, secure authentication via **Clerk**, vision intelligence via **OpenRouter**, and live pricing comparisons via **Google Shopping (SerpApi)** — helping thrift flippers, estate sale resellers, and casual sellers eliminate the #1 bottleneck in their workflow: writing listings.

---

## ✨ Key Features

1. 📷 **Photo-to-Listing AI**
   * Upload a photo of any item and the AI identifies the product, generates a title, description, condition grade, and price range — in under 10 seconds.

2. 🏪 **Platform Router**
   * Recommends the best marketplace (eBay, Poshmark, Vinted, Etsy, Facebook Marketplace) based on item category, condition, and current sell-through trends.

3. 💵 **Live Pricing Comps**
   * Fetches real sold listings via **Google Shopping (SerpApi)** to suggest a High / Average / Low price range — not just a ballpark.

4. 🔍 **Condition Auto-Assessment**
   * AI grades item condition (New, Like New, Good, Fair) from the photo and flags visible flaws — reducing buyer surprises and returns.

5. 🎨 **Platform Tone Adaptor**
   * Rewrites the same listing in Poshmark's casual style, eBay's keyword-dense format, and Etsy's narrative style — automatically.

6. 📦 **Batch Mode**
   * Upload 10 items in one session and generate all listings before you get home from the thrift store.

7. 🔐 **Auth & User Accounts**
   * Secure sign-in and sign-up powered by **Clerk**, with post-auth redirect to `/analyze`.

8. 💳 **Subscription Tiers (DodoPayments)**
   * **Hustler**, **Flipper**, and **Pro** plans with hosted checkout links — no Stripe setup required.

9. 🗄️ **Real-Time Backend**
   * **Convex** handles real-time data sync, listing history, and user state management.

10. 🌐 **Responsive Design**
    * Mobile-first layout styled with **Tailwind CSS** — optimized for resellers on the go.

---

## 🛠 Tech Stack

* **Framework**: Next.js (App Router) + TypeScript
* **Backend / Database**: Convex (real-time backend-as-a-service)
* **Auth**: Clerk
* **Styling**: Tailwind CSS
* **Vision AI**: OpenRouter API (multimodal LLM — photo analysis & listing generation)
* **Pricing Data**: SerpApi — Google Shopping
* **Payments**: DodoPayments (hosted checkout)
* **Icons**: lucide-react
* **State Management**: React `useState`, `useEffect`, Convex reactive queries

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/snaplist-ai.git
cd snaplist-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root of the project and add the following:

```dotenv
# Convex Backend
CONVEX_DEPLOYMENT=dev:your-project
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-project.convex.site

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/analyze
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/analyze

# OpenRouter (for vision AI)
OPENROUTER_API_KEY=sk-or-your_key_here

# Google Shopping via SerpApi (live pricing comps)
SERPAPI_API_KEY=your_serpapi_key
GOOGLE_SHOPPING_GL=us
GOOGLE_SHOPPING_HL=en

# DodoPayments (subscription billing)
DODO_API_KEY=your_dodo_api_key
DODO_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_DODO_HUSTLER_LINK=https://checkout.example.com/hustler
NEXT_PUBLIC_DODO_FLIPPER_LINK=https://checkout.example.com/flipper
NEXT_PUBLIC_DODO_PRO_LINK=https://checkout.example.com/pro

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ **Note**: The keys above are development/test keys. Replace with your own production credentials before deploying.

### 4. Start the Convex Dev Server

In a **separate terminal**, run:

```bash
npx convex dev
```

This connects your local app to your Convex deployment (`dev:benevolent-sheep-464`) and keeps your schema and functions in sync.

### 5. Run the App Locally

```bash
npm run dev
```

Open: `http://localhost:3000`

You will be redirected to `/sign-in` on first visit. After signing in or signing up, you'll land on `/analyze` — the main listing generator.

---

## 🎯 Usage Guide

1. **Sign In / Sign Up**: Create an account or log in via Clerk at `/sign-in` or `/sign-up`.
2. **Navigate to Analyze**: After authentication, you're redirected to `/analyze` automatically.
3. **Upload a Photo**: Drag and drop or click to upload a photo of your item.
4. **AI Generates Your Listing**:
   * Product identification
   * Optimized title (SEO-ready)
   * Full description (platform-adapted tone)
   * Condition grade (New / Like New / Good / Fair) with flaw callouts
   * Competitive price range (High / Avg / Low) sourced from live sold comps
   * Platform recommendation (eBay, Poshmark, Vinted, Etsy, Facebook Marketplace)
5. **Copy or Export**: One-click copy your listing for any platform, or save it to your listing history via Convex.
6. **Upgrade Plan**: Visit the pricing page to unlock more monthly listings — choose **Hustler**, **Flipper**, or **Pro** via the DodoPayments hosted checkout.

---

## 💳 Subscription Plans

| Plan | Monthly Price | Listings / Month | Key Features |
|------|--------------|-----------------|--------------|
| **Free** | $0 | 10 | Basic title + description, 2 platforms |
| **Hustler** | $12 | 100 | All features, live pricing comps, 6 platforms |
| **Flipper** | $24 | 500 | Batch mode, platform router, priority support |
| **Pro** | $49 | Unlimited | Full API access, team seats, analytics dashboard |

Checkout is handled via **DodoPayments** — no credit card info is stored in the app. Webhook events sync subscription status back to your Convex backend via `DODO_WEBHOOK_SECRET`.

---

## 🔧 Customization & Extensibility

* **Vision Model**: Swap the OpenRouter model in your listing service (e.g., switch from `meta-llama/llama-3.2-11b-vision-instruct` to `google/gemini-pro-vision`) by updating the model string in your API call.
* **Pricing Source**: Replace SerpApi with eBay's Finding API or Poshmark's public sold data for category-specific comps.
* **Additional Platforms**: Extend the platform router logic by adding new marketplace profiles (price sensitivity, category fit, audience demographics) in the router config file.
* **Convex Schema**: Add new tables (e.g., `savedTemplates`, `listingHistory`, `userPreferences`) in `convex/schema.ts` and define corresponding query/mutation functions.
* **Payments**: DodoPayments webhooks land at `/api/webhooks/dodo`. Extend the handler to manage plan upgrades, downgrades, and cancellations.
* **Analytics**: Add Plausible or PostHog via `<Script>` in `app/layout.tsx` for event tracking on listing generations and upgrades.

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork this repository.
2. Create a branch:
   ```bash
   git checkout -b feature/YourFeature
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature description"
   ```
4. Push to GitHub:
   ```bash
   git push origin feature/YourFeature
   ```
5. Open a Pull Request describing your improvements.

Please make sure your changes are tested locally with `npx convex dev` running alongside `npm run dev` before submitting.

---

## 📄 License

MIT License. See `LICENSE` for details.

<div align="center">

# ⚡ ContentForge

### AI-Powered Content Repurposing for Creators & Freelancers

**Turn one piece of long-form content into 10+ platform-native formats in under 60 seconds.**  
Powered by Anthropic Claude & xAI Grok · Built on Next.js 16, Convex, and Clerk.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Convex](https://img.shields.io/badge/Convex-1.33-orange)](https://convex.dev)
[![Clerk](https://img.shields.io/badge/Clerk-7-purple?logo=clerk)](https://clerk.com)
[![Polar.sh](https://img.shields.io/badge/Polar.sh-billing-green)](https://polar.sh)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)

</div>

---

## 📖 Table of Contents

- [What is ContentForge?](#-what-is-contentforge)
- [Features](#-features)
- [Output Formats](#-output-formats)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Running the App](#-running-the-app)
- [Pricing Tiers](#-pricing-tiers)
- [AI Provider Strategy](#-ai-provider-strategy)
- [Webhook Setup](#-webhook-setup)
- [Deployment](#-deployment)

---

## 🚀 What is ContentForge?

ContentForge is a full-stack AI SaaS application that solves one of the biggest pain points for content creators: **repurposing**. Instead of spending hours manually adapting a podcast transcript or blog post for every platform, ContentForge does it in seconds.

Paste your content → select your output formats → watch results stream in real-time as Claude and Grok work in parallel.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Real-time streaming outputs** | Outputs appear one-by-one as the AI completes each format — no waiting for the full batch |
| **Dual-AI routing** | Claude handles quality long-form formats; Grok handles platform-native short-form content |
| **Brand Voice (Pro)** | Train the AI on your writing style — provide sample texts and a voice description |
| **Usage metering** | Monthly run counters with automatic resets, enforced per subscription tier |
| **Subscription billing** | Polar.sh-powered checkout with Free / Starter / Pro tiers |
| **Auth + user sync** | Clerk authentication with real-time user sync to Convex via verified webhooks |
| **History** | All past projects stored and browsable with expandable output panels |
| **Dark mode** | System-aware theme with manual toggle via next-themes |
| **GSAP animations** | Scroll-triggered entrance animations on the marketing landing page |
| **Fully type-safe** | Strict TypeScript across the entire stack — frontend, backend, and API layer |

---

## 🎨 Output Formats

| Format | AI Provider | Tier |
|---|---|---|
| Twitter / X Thread | ⚡ Grok | Free |
| LinkedIn Post | ⚡ Grok | Free |
| Instagram Caption | ⚡ Grok | Free |
| Key Takeaways | 🤖 Claude | Free |
| Short-form Video Script | ⚡ Grok | Starter |
| Newsletter Section | 🤖 Claude | Starter |
| Email Sequence (3-part) | 🤖 Claude | Starter |
| YouTube Description | 🤖 Claude | Starter |
| Blog Post Summary | 🤖 Claude | Pro |
| Podcast Show Notes | 🤖 Claude | Pro |
| Pinterest Pin Copy | ⚡ Grok | Pro |
| TikTok Hook Script | ⚡ Grok | Pro |

---

## 🛠 Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org)** — App Router, React Server Components, Server Actions
- **[TailwindCSS v4](https://tailwindcss.com)** — Utility-first CSS with CSS variables for theming
- **[ShadCN UI](https://ui.shadcn.com)** — Component library built on Base UI (v4 — `render` prop pattern)
- **[GSAP 3](https://gsap.com)** — Professional-grade scroll animations with ScrollTrigger
- **[next-themes](https://github.com/pacocoursey/next-themes)** — System-aware dark/light mode

### Backend
- **[Convex](https://convex.dev)** — Real-time database, serverless functions, and HTTP actions
- **[Clerk](https://clerk.com)** — Authentication, user management, and JWT issuance for Convex

### AI
- **[Anthropic Claude](https://anthropic.com)** (`claude-opus-4-5`) — Quality long-form content generation
- **[xAI Grok](https://x.ai)** (`grok-3`) — Platform-native short-form content with social context

### Billing
- **[Polar.sh](https://polar.sh)** — Subscription management, checkout sessions, and customer state webhooks

### Infrastructure
- **[Svix](https://svix.com)** — Webhook signature verification for Clerk → Convex user sync

---

## 🏗 Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                         Browser                          │
│   ClerkProvider → ConvexProviderWithClerk → ThemeProvider│
│                                                          │
│   ┌───────────────┐    ┌───────────────────────────────┐ │
│   │  Marketing    │    │      App (/dashboard)         │ │
│   │  Landing +    │    │  useQuery  (real-time)        │ │
│   │  Pricing      │    │  useMutation (optimistic UI)  │ │
│   └───────────────┘    └───────────────────────────────┘ │
└──────────────────────────┬───────────────────────────────┘
                           │ WebSocket (Convex live queries)
┌──────────────────────────▼───────────────────────────────┐
│                     Convex Backend                        │
│                                                          │
│  queries / mutations  →  schema-validated TypeScript      │
│  actions (use node)   →  Claude API + Grok API           │
│  http router          →  Clerk webhook (user sync)       │
│  scheduler            →  runAfter(0, repurposeContent)   │
└──────────────────────────┬───────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          ▼                                 ▼
 ┌─────────────────┐               ┌──────────────────┐
 │ Anthropic Claude│               │  xAI Grok API    │
 │  (claude-opus)  │               │  (api.x.ai/v1)   │
 └─────────────────┘               └──────────────────┘
```

**Data flow for a repurposing job:**
1. User submits → `createProject` mutation validates usage limits → inserts project with `status: pending`
2. `ctx.scheduler.runAfter(0, internal.ai.repurposeContent)` fires immediately after the mutation commits
3. AI action fetches brand voice (Pro users), fans out to Claude/Grok in parallel batches of 5
4. Each completed output is saved via `internal.outputs.saveOutput` as it arrives
5. `useQuery(api.outputs.getForProject)` on the frontend reactively updates — outputs stream in one by one

---

## 📁 Project Structure

```
.
├── app/
│   ├── (app)/                     # Authenticated app shell
│   │   ├── layout.tsx             # Sidebar + top bar + ThemeToggle
│   │   ├── dashboard/page.tsx     # Main repurposing workspace
│   │   ├── history/page.tsx       # Past projects browser with expandable rows
│   │   └── brand-voice/page.tsx   # Pro: brand voice training form
│   ├── (marketing)/
│   │   ├── page.tsx               # Landing page (GSAP scroll animations)
│   │   └── pricing/page.tsx       # Pricing tiers + Polar.sh checkout
│   ├── api/webhook/polar/         # Polar.sh subscription state webhook
│   ├── actions/billing.ts         # Server Action: create Polar checkout session
│   ├── checkout/route.ts          # Polar checkout redirect handler
│   └── layout.tsx                 # Root layout (all providers)
│
├── convex/
│   ├── schema.ts                  # DB schema: users, projects, outputs, brandVoice
│   ├── users.ts                   # User CRUD, Clerk sync, subscription updates
│   ├── projects.ts                # Project creation with usage limit enforcement
│   ├── outputs.ts                 # Real-time output queries + internal save mutation
│   ├── ai.ts                      # Core AI action (Claude + Grok, batched parallel)
│   ├── prompts.ts                 # Format definitions, tier mappings, prompt builder
│   ├── auth.config.ts             # Clerk JWT provider config
│   └── http.ts                    # HTTP router (/clerk-users-webhook)
│
├── components/
│   ├── ConvexClientProvider.tsx   # Bridges Clerk useAuth → Convex JWT
│   ├── ThemeProvider.tsx          # next-themes wrapper
│   └── ThemeToggle.tsx            # Sun/Moon icon button
│
├── lib/
│   ├── polar.ts                   # Polar SDK client singleton
│   ├── plans.ts                   # Plan config + Polar product ID constants
│   ├── types.ts                   # Shared interfaces: ConvexOutput, ConvexProject
│   └── utils.ts                   # cn() — clsx + tailwind-merge
│
├── middleware.ts                  # Clerk route protection
└── .env.local                     # Environment variables
```

---

## 🏁 Getting Started

### Prerequisites

- **Node.js 20+** and **npm 10+**
- Accounts at: [Clerk](https://clerk.com), [Convex](https://convex.dev), [Anthropic](https://console.anthropic.com), [xAI](https://console.x.ai)
- Optional for billing: [Polar.sh](https://polar.sh)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/contentforge.git
cd contentforge
npm install
```

### 2. Configure Environment

Fill in `.env.local` — see the [Environment Variables](#-environment-variables) table below.

### 3. Initialize Convex

```bash
npx convex dev
```

This prompts you to create/select a project, then auto-writes `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT` to `.env.local`.

### 4. Configure Clerk JWT for Convex

In [Clerk Dashboard](https://dashboard.clerk.com) → **JWT Templates** → **New Template** → select **Convex**:
- Name: `convex` → click **Save**

Then set `CLERK_JWT_ISSUER_DOMAIN` in the [Convex environment variables dashboard](https://dashboard.convex.dev):
```
https://<your-clerk-subdomain>.clerk.accounts.dev
```

### 5. Start Dev

```bash
# Terminal 1 — keep running
npx convex dev

# Terminal 2
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🔐 Environment Variables

| Variable | Where to find it | Required |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys | ✅ |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys | ✅ |
| `CLERK_WEBHOOK_SECRET` | Clerk Dashboard → Webhooks → your endpoint | ✅ |
| `NEXT_PUBLIC_CONVEX_URL` | Auto-set by `npx convex dev` | ✅ |
| `CONVEX_DEPLOYMENT` | Auto-set by `npx convex dev` | ✅ |
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk Dashboard → JWT Templates → Convex → Issuer | ✅ |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) | ✅ |
| `XAI_API_KEY` | [console.x.ai](https://console.x.ai) | ✅ |
| `CONVEX_INTERNAL_WEBHOOK_SECRET` | Any random 64-char hex string | ✅ |
| `POLAR_ACCESS_TOKEN` | Polar Dashboard → Settings → API | Billing only |
| `POLAR_WEBHOOK_SECRET` | Polar Dashboard → Webhooks | Billing only |
| `NEXT_PUBLIC_POLAR_STARTER_PRODUCT_ID` | Polar Dashboard → Products | Billing only |
| `NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID` | Polar Dashboard → Products | Billing only |
| `POLAR_SERVER` | `sandbox` (dev) or `production` (live) | Billing only |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` in dev | ✅ |

---

## ▶️ Running the App

```bash
# Development
npx convex dev          # Convex backend + live function watcher
npm run dev             # Next.js frontend on :3000

# Type checking
npx tsc --noEmit

# Production build
npm run build && npm start
```

---

## 💳 Pricing Tiers

| | Free | Starter | Pro |
|---|---|---|---|
| **Price** | $0/mo | $19/mo | $49/mo |
| **Runs / month** | 3 | 30 | Unlimited |
| **Free-tier formats** | ✅ | ✅ | ✅ |
| **Starter formats** | ❌ | ✅ | ✅ |
| **Pro formats** | ❌ | ❌ | ✅ |
| **Brand Voice training** | ❌ | ❌ | ✅ |

> A "run" = one repurposing job, regardless of how many formats are selected.

---

## 🤖 AI Provider Strategy

ContentForge routes each output format to the most appropriate model:

**Claude (Anthropic)** — formats requiring quality, nuance, and long-form reasoning:
Key takeaways, newsletter sections, email sequences, blog summaries, podcast show notes, YouTube descriptions

**Grok (xAI)** — formats requiring platform-native voice and cultural context:
Twitter/X threads, LinkedIn posts, Instagram captions, TikTok hooks, Pinterest copy, short-form video scripts

Jobs run in parallel batches of 5 to respect API rate limits. Each output is saved and pushed to the UI as it completes — users see a live feed of results rather than a loading spinner.

---

## 🔗 Webhook Setup

### Clerk → Convex (User Sync)

1. Clerk Dashboard → **Webhooks** → **Add Endpoint**
2. URL: `https://<your-deployment>.convex.site/clerk-users-webhook`
   - Use `.convex.site` (not `.convex.cloud`) — this is the HTTP actions URL
3. Subscribe to: `user.created`, `user.updated`, `user.deleted`
4. Copy the **Signing Secret** → `CLERK_WEBHOOK_SECRET`

### Polar.sh → Next.js (Subscription Updates)

1. Polar Dashboard → **Webhooks** → **Add Endpoint**
2. URL: `https://your-domain.com/api/webhook/polar`
3. Subscribe to: `customer.state_changed`, `subscription.created`, `subscription.canceled`
4. Copy the secret → `POLAR_WEBHOOK_SECRET`

---

## 🚢 Deployment

### Frontend — Vercel

```bash
vercel --prod
```

Set all env vars in the Vercel dashboard. For production:
- Set `POLAR_SERVER=production`
- Update `NEXT_PUBLIC_BASE_URL` to your live domain
- Add your production domain to Clerk's allowed redirect URLs

### Backend — Convex

```bash
npx convex deploy
```

Set `CLERK_JWT_ISSUER_DOMAIN` and `CONVEX_INTERNAL_WEBHOOK_SECRET` as environment variables in the Convex production dashboard.

---

<div align="center">

Built with the best developer tools available in 2026.

[Convex](https://convex.dev) · [Clerk](https://clerk.com) · [Polar.sh](https://polar.sh) · [Anthropic](https://anthropic.com) · [xAI](https://x.ai)

</div>

# Midnight Creations USA — Ecommerce Platform Plan
**Web (Next.js) + API (Node.js) + PostgreSQL + Mobile (Expo React Native)**

---

## 0. What I scraped from mcreationsusa.com

| Aspect | Finding |
|---|---|
| Business | Nicole Papadopoulos, Orange, CT. Screen printing, embroidery, engraving, sublimation, custom apparel/promo shop. Started during COVID making masks. |
| Storefront today | Wix site with a "Shop All" catalog (product-page per SKU), category filters (Amity, Amity Chamber of Commerce, Town of Orange, Laser Creations, Affirmations, Baby, Apparel, Easter, Mother's Day), price filter ($5–$70), and per-category variant filters (size, color, style — e.g. "Lovey Style: Blue Bunny/Blue Whale/Pink Bunny", adult sizes 2XL–4XL/youth sizes). |
| Core revenue lines | 1) Direct retail (Shop All / Etsy), 2) **Custom quote requests** (B2B/organizations — apparel, signs, banners, promo gifts), 3) **"Host a Store"** — white-labeled fundraiser/team/school stores with a dedicated account manager, marketing toolkit, mid-sale updates (currently run on a 3rd-party "itemorder.com" platform), 4) **"Promote Your Business"** — a separate promo-products micro-site (espwebsites.com). |
| Local/community angle | Town of Orange, Amity (local school) branded merch — strong hyperlocal/community identity. |
| Contact | 200 Boston Post Rd, Orange, CT 06477 · info@mcreationsusa.com · 475-375-7396 · Facebook/Instagram/Etsy. |
| Gaps vs. modern ecom | No native cart-to-checkout UX shown (Wix store), no account/order-history surfaced, fundraiser stores are off-platform (itemorder.com — a **major consolidation opportunity**), no personalization, no AI search/chat, no mobile app. |

**Product implication:** this isn't a generic single-SKU storefront. The platform must natively support **(a)** a normal storefront, **(b)** a print-shop "get a quote" workflow with file uploads and quoted pricing, and **(c)** a **multi-tenant "sub-store" / fundraiser** system (this is the single biggest differentiator and highest-value feature to bring in-house from itemorder.com).

---

## 1. Product Scope (Modules)

1. **Storefront (B2C retail)** — browse, search, PDP, cart, checkout, guest + account checkout, order tracking, reviews.
2. **Product Customization Engine** — apparel with size/color/style variants; personalization (e.g. name/number printing) with live preview; print-method metadata (screen print, embroidery, sublimation, laser engraving, DTF) driving lead time & pricing.
3. **Custom Quote / RFQ Workflow** — form with file upload (logos/art), quantity, garment type, decoration method → creates a `quote_request` → admin prices it → customer approves → converts to an order (deposit + balance, or full payment).
4. **Fundraiser / Team / School "Host-a-Store" (Multi-tenant Storefronts)** — organizers self-serve create a branded micro-store (subdomain or `/store/[slug]`) with a curated product set, a fundraiser end date, a per-item commission %, and a dedicated MC account manager assigned; supporters buy through it; organizer gets a dashboard + payout; MC gets a marketing toolkit (auto-generated flyer/QR code).
5. **Promotional Products B2B Portal** — company/brand accounts, bulk quoting, saved logos, reorder.
6. **Content/CMS** — homepage sections, category landing pages (Amity Swag, Town of Orange, Affirmations & Inspiration), blog/portfolio/testimonials, email signup.
7. **AI Layer** — conversational shopping assistant, semantic/visual search, recommendations, quote-estimation assistant, size/fit assistant, review summarization, admin copilot.
8. **Admin/Back-office (Operator Console)** — products, inventory, orders, quotes, fundraisers, CMS, users/roles, discounts, reporting, production/fulfillment queue (screen print vs. embroidery vs. laser job routing).
9. **Mobile App (Expo/React Native)** — full customer experience + push notifications + organizer fundraiser management on the go.

---

## 2. High-Level Architecture

```
                                   ┌───────────────────────────┐
                                   │        CDN / Edge          │
                                   │  (Cloudflare / Vercel Edge)│
                                   └─────────────┬──────────────┘
                     ┌───────────────────────────┼───────────────────────────┐
                     │                           │                           │
             ┌───────▼────────┐         ┌────────▼─────────┐        ┌────────▼────────┐
             │  Next.js Web    │         │  Expo Mobile App  │        │  Admin Console   │
             │ (App Router,    │         │ (iOS/Android,     │        │ (Next.js, role-  │
             │  RSC, ISR/SSR)  │         │  EAS Build/OTA)    │        │  gated routes)   │
             └───────┬────────┘         └────────┬──────────┘        └────────┬────────┘
                     │        REST/GraphQL/tRPC over HTTPS + WebSocket (realtime)
                     └───────────────────────────┼───────────────────────────┘
                                                  │
                                     ┌────────────▼─────────────┐
                                     │      API Gateway / BFF     │
                                     │ (Node.js/NestJS, Fastify)  │
                                     │  AuthN/Z, rate limit, WAF   │
                                     └────────────┬──────────────┘
        ┌────────────────┬────────────────┬──────┴───────┬────────────────┬─────────────────┐
        │                │                │              │                │                 │
 ┌──────▼─────┐   ┌──────▼──────┐  ┌──────▼──────┐ ┌─────▼──────┐  ┌──────▼───────┐  ┌───────▼───────┐
 │ Catalog Svc │   │ Orders/Cart │  │ Quote/RFQ   │ │ Storefront │  │ AI Service    │  │ Search Svc     │
 │ (products,  │   │ Checkout Svc│  │ Service     │ │ (Tenant)   │  │ (chat, recs,  │  │ (Meilisearch/  │
 │ variants,   │   │ (Stripe)    │  │ (uploads,   │ │ Service    │  │ embeddings,   │  │  Typesense +   │
 │ inventory)  │   │             │  │  pricing)   │ │ (multi-    │  │ moderation)   │  │  pgvector)     │
 └──────┬─────┘   └──────┬──────┘  └──────┬──────┘ │  tenant    │  └──────┬───────┘  └───────┬────────┘
        │                │                │        │  stores)   │         │                  │
        └────────────────┴────────────────┴────┬───┴─────┬─────┘         │                  │
                                                 │         │               │                  │
                                          ┌──────▼───┐ ┌───▼─────┐  ┌──────▼──────┐   ┌───────▼───────┐
                                          │PostgreSQL│ │  Redis   │  │  Queue/Jobs  │   │ Vector Store   │
                                          │ (primary,│ │(cache,   │  │ (BullMQ +    │   │ (pgvector on   │
                                          │ RLS multi│ │ sessions,│  │  Redis)      │   │  Postgres)     │
                                          │ -tenant) │ │ rate-lim)│  └──────┬──────┘   └────────────────┘
                                          └──────────┘ └──────────┘         │
                                                                     ┌──────▼───────────────────┐
                                                                     │ Workers: emails, images,   │
                                                                     │ recommendation refresh,    │
                                                                     │ payout calc, print-file    │
                                                                     │ mockup generation, webhooks│
                                                                     └────────────────────────────┘

External: Stripe (payments+Connect for organizer payouts), S3/R2 (media & art uploads),
SendGrid/Postmark (email), Twilio (SMS), Anthropic/OpenAI API (LLM), Sentry, PostHog/Segment,
Algolia/Meilisearch (optional managed search), ShipEngine/EasyPost (shipping rates/labels),
TaxJar/Stripe Tax (sales tax).
```

### Architectural style
- **Modular monolith first, service-ready boundaries** (Domain modules inside one NestJS app, each with its own Postgres schema namespace) — right-sized for a local CT print shop, but structured so any module (e.g. AI, Search, Quote) can be extracted into its own service later without a rewrite.
- **BFF pattern**: Next.js server components/route handlers call internal API via a typed client (tRPC or generated OpenAPI SDK) — avoids waterfall client fetches, keeps secrets server-side.
- **Multi-tenancy for fundraiser stores**: single Postgres DB, `tenant_id` (store_id) column + **Postgres Row-Level Security (RLS)** on all tenant-scoped tables. Each fundraiser store is a row in `stores`, not a separate DB — keeps local Postgres simple while still isolating data logically and enforceably at the DB layer.

---

## 3. Tech Stack (exact choices, per your constraints)

### Web
- **Next.js 15 (App Router)**, React Server Components, Server Actions for form/mutation-light flows, `next/image` + a media CDN, ISR for category/PDP pages, streaming SSR for the AI chat panel.
- **TypeScript** everywhere (web, API, mobile) — one shared type system.
- **TailwindCSS + shadcn/ui** for design system consistency web ↔ admin.
- **Zustand** or React Context for lightweight client state (cart drawer, filters); **TanStack Query** for server-state caching/optimistic updates.
- **Zod** for schema validation shared across API/web/mobile via a shared package.

### API / Backend
- **Node.js 22 LTS + NestJS** (opinionated, modular, DI-friendly — ideal for domain modules described above). Fastify adapter for performance.
- **tRPC** for internal Next.js↔API calls (end-to-end type safety) **+ a public REST/OpenAPI layer** for mobile app, webhooks, and any future 3rd-party integrations (POS, wholesale API).
- **Prisma ORM** on PostgreSQL (fast iteration, migrations, great TS types) — or **Drizzle ORM** if you want closer-to-SQL control/perf; recommend **Prisma for velocity + Drizzle for hot-path queries (search, reporting)** used side by side.
- **PostgreSQL 16 (local)** as system of record; **pgvector extension** for embeddings (no separate vector DB needed at this scale); **Postgres RLS** for multi-tenant isolation.
- **Redis** — sessions/cache/rate-limiting + **BullMQ** for background jobs (emails, mockup image generation, recommendation batch jobs, payout calculations, abandoned-cart flows).
- **Auth**: Auth.js (NextAuth) or a custom JWT + refresh-token service in NestJS with Argon2 password hashing, OAuth (Google/Apple/Facebook — Facebook matters here since they're active on FB), magic-link email login, and **role-based + tenant-based authorization** (customer, organizer, admin, superadmin, production-staff).
- **File/media storage**: S3-compatible (AWS S3 or Cloudflare R2) for product images, customer art uploads (quote requests), print-ready mockups. Virus/malware scan on uploads (ClamAV in worker) before admin can open.

### Mobile
- **Expo (React Native, SDK latest, Expo Router)** — shares the same TypeScript domain/validation/API-client packages as web via a monorepo.
- **Expo Application Services (EAS)** for build + OTA updates.
- **Expo Notifications** (push) + **Expo Secure Store** (token storage) + **React Query** shared with web.
- **NativeWind** (Tailwind for RN) to reuse design tokens from the web design system.

### Monorepo
- **Turborepo (or Nx)** with pnpm workspaces:
```
mcreations/
├── apps/
│   ├── web/            # Next.js storefront + admin (or split admin into its own app)
│   ├── admin/          # optional separate Next.js admin app
│   ├── mobile/         # Expo app
│   └── api/            # NestJS backend
├── packages/
│   ├── db/             # Prisma schema, migrations, seed scripts
│   ├── shared-types/   # Zod schemas + inferred TS types (Product, Order, Quote, Store...)
│   ├── api-client/      # tRPC client + REST SDK, shared by web & mobile
│   ├── ui/              # shadcn-based design system (web) 
│   ├── ui-native/       # NativeWind component mirror for mobile
│   └── config/          # eslint, tsconfig, tailwind presets
├── infra/               # IaC (Terraform/Pulumi), Docker, k8s or Fly/Render configs
└── docs/                # ADRs, runbooks
```

### Infra / DevOps
- **Docker Compose** for local dev (Postgres, Redis, mailhog, minio-as-S3).
- **CI/CD**: GitHub Actions — lint, typecheck, unit/integration tests, Prisma migration check, Playwright E2E, build, preview deploy (Vercel for web, Fly.io/Render/EC2 for API+Postgres), EAS build for mobile on tag.
- **Hosting**: Vercel (web/admin), Render/Fly.io/AWS ECS (API + workers), managed Postgres (RDS or Fly Postgres) mirroring the "local Postgres" dev setup, Upstash/Elasticache Redis.
- **Observability**: Sentry (errors, web+API+mobile), OpenTelemetry traces → Grafana/Tempo or Honeycomb, PostHog (product analytics + session replay) or Segment→GA4/Meta CAPI, structured logs (pino) → Loki/CloudWatch.
- **Security**: Cloudflare WAF/DDoS, secrets in Doppler/1Password/GH Encrypted Secrets, OWASP ASVS checklist, dependency scanning (Snyk/Dependabot), PCI compliance via Stripe Elements/Payment Element (never touch raw card data).

---

## 4. Core Data Model (PostgreSQL)

> Full DDL is in `02-DATABASE-SCHEMA.sql`. Summary of key entities:

**Identity & Access**
- `users` (customers, organizers, staff — one table, `role` enum + `store_memberships` join for organizer↔store)
- `accounts` (OAuth providers), `sessions`, `password_resets`

**Catalog**
- `products`, `product_variants` (size/color/style/SKU/price/weight), `product_options` + `product_option_values` (generic EAV-ish for size/color/lovey-style etc. — mirrors the Wix filter structure you scraped), `categories` (self-referencing, e.g. Amity → Amity Swag), `product_categories` (m2m), `product_images`, `print_methods` (screen_print, embroidery, sublimation, laser_engraving, dtf) + `product_print_methods`, `personalization_fields` (e.g. "Add Name", "Add Number") for on-PDP customization.

**Multi-tenant Fundraiser Stores**
- `stores` (id, slug, name, owner_user_id, type[fundraiser|team|school|business], commission_pct, start_at, end_at, status, theme/branding json, account_manager_id)
- `store_products` (which catalog products/variants + custom price/commission are available in this store)
- `store_orders` (FK to `orders`, denormalized store_id for RLS)
- `store_payouts` (period, gross_sales, commission, net_payout, status, paid_at)
- `store_marketing_assets` (generated flyer PDF, QR code URL)

**Commerce**
- `carts`, `cart_items` (variant_id, personalization json, qty, store_id nullable)
- `orders`, `order_items`, `order_status_history`, `payments` (Stripe payment_intent refs), `refunds`, `discounts`/`coupons`, `shipments` (carrier, tracking, label), `addresses`
- `quote_requests` (customer info, decoration method, garment type, qty, deadline, notes), `quote_attachments` (S3 keys — art files), `quote_line_items` (admin-priced), `quote_status_history`

**Reviews / Content**
- `reviews`, `review_images`, `wishlists`, `wishlist_items`, `cms_pages`, `cms_blocks`, `testimonials`, `email_subscribers`

**AI / Personalization**
- `product_embeddings` (pgvector column), `user_events` (view/add-to-cart/purchase clickstream for recs), `chat_conversations`, `chat_messages`, `recommendation_cache`

**Ops**
- `inventory_movements`, `production_jobs` (link order_item → print method → status: queued/printing/QC/ready), `audit_logs`, `webhooks_log`

---

## 5. API Design (representative endpoints)

**Public REST (consumed by mobile + 3rd parties; mirrored as tRPC for web)**
```
GET    /v1/products?category=&price_min=&price_max=&color=&size=&store=
GET    /v1/products/:slug
GET    /v1/categories
POST   /v1/cart                      # create/merge cart
POST   /v1/cart/:id/items
PATCH  /v1/cart/:id/items/:itemId
POST   /v1/checkout/session          # Stripe Checkout/PaymentIntent
POST   /v1/orders/:id/confirm
GET    /v1/orders/:id
GET    /v1/me/orders

POST   /v1/quotes                    # RFQ submission (multipart: files + JSON)
GET    /v1/quotes/:id
POST   /v1/quotes/:id/approve
POST   /v1/quotes/:id/messages       # threaded Q&A with staff

POST   /v1/stores                    # organizer creates fundraiser store
GET    /v1/stores/:slug
PATCH  /v1/stores/:id
GET    /v1/stores/:id/dashboard      # sales, top products, payout status
GET    /v1/stores/:id/marketing-kit  # flyer/QR generation

POST   /v1/ai/chat                   # streamed SSE/WebSocket
POST   /v1/ai/visual-search          # image upload -> similar products
GET    /v1/recommendations?context=pdp:{id}|cart|home

POST   /v1/auth/register|login|refresh|magic-link
GET    /v1/auth/me

# Admin (role-gated, separate namespace)
/v1/admin/products, /v1/admin/orders, /v1/admin/quotes, /v1/admin/stores,
/v1/admin/production-jobs, /v1/admin/reports, /v1/admin/cms
```

**Webhooks in**: Stripe (payment/refund/dispute), ShipEngine/EasyPost (tracking updates).
**Webhooks out**: order.created/fulfilled → Slack/email to shop staff; store.payout.ready → organizer email.

---

## 6. AI Feature Set (the "modern ecom" layer)

1. **AI Shopping Assistant (RAG chatbot)** — Claude/GPT with function-calling over your own APIs (`search_products`, `get_order_status`, `start_quote`, `check_fundraiser_store`). Grounded in a **RAG index over your catalog, FAQ, and policies** (pgvector) so it never hallucinates prices/shipping. Handles: "find me a small navy hoodie under $35", "where's my order #1234", "I need 50 embroidered polos for my team by June", "what's the Amity fundraiser link".
2. **Quote-Estimation Copilot** — customer describes the job in chat/upload art → LLM extracts structured fields (garment, qty, colors, decoration method) into the `quote_requests` schema and gives a **rough price range** from a pricing-rules table, then routes to staff for final quote — cuts response time on your highest-margin channel.
3. **Recommendation Engine** — hybrid:
   - *Content-based*: category/tag/attribute similarity + text embeddings (pgvector cosine similarity) for "similar products" and cold-start.
   - *Collaborative filtering*: co-purchase/co-view matrix (implicit feedback) computed nightly (batch job) for "customers also bought" — implementable with `pgvector` + a simple ALS/ItemKNN job, or a managed option (AWS Personalize) later.
   - *Session-based*: real-time re-ranking using current cart/browse context (Redis-stored session vector).
   - Surfaces: homepage "for you", PDP "goes well with", cart "add these too", post-purchase email.
4. **Semantic + Visual Search** — text embeddings for typo-tolerant/intent search ("teacher gift under $20"); optional **image similarity search** (CLIP embeddings) so a customer can upload a photo of a design and find similar products — nice fit for a print shop with lots of visually distinct designs.
5. **Size/Fit Assistant** — simple rules/ML classifier from height/weight/previous size selections + return data → suggests size, reduces exchanges.
6. **Review Summarization & Moderation** — LLM summarizes reviews into pros/cons bullets; toxicity/PII filter before publishing.
7. **Personalization Preview Generation** — for name/number/logo personalization, generate a live mockup (canvas/WebGL on web, image compositing via API for mobile) — optionally LLM-assisted design suggestions ("make my logo look good on a hoodie").
8. **Admin Copilot** — natural-language reporting ("show me last week's Amity store sales vs. last year"), auto-drafted responses to quote inquiries, auto-generated fundraiser marketing copy/flyer text.
9. **Marketing Automation** — abandoned cart / abandoned quote email-SMS sequences, AI-generated subject lines/copy variants (A/B tested).

**Implementation notes**: use Anthropic/OpenAI API server-side only (never expose keys to client), stream via SSE/WebSocket, log every AI interaction (`chat_messages`) for eval/fine-tuning later, put a moderation + cost-guard layer (max tokens, rate limit per user) in front of the LLM calls, and cache embeddings so re-runs are cheap.

---

## 7. Multi-tenant Fundraiser Store Flow (key differentiator)

1. Organizer fills "Host a Store" application (org name, cause, goal, dates) → `store` row created in `pending` status, assigned an `account_manager_id` (staff).
2. Admin approves, curates `store_products` (subset of catalog + optional exclusive designs) and sets commission %.
3. Store goes `live` at a slug (`mcreationsusa.com/store/amity-field-hockey-2025`) with organizer's branding (logo/colors from a small theme JSON) — served via **ISR** so each store page is fast and cache-friendly per tenant.
4. Auto-generated **marketing kit**: QR code (svg→png), flyer PDF (templated via a headless render, e.g. Puppeteer/Playwright or `@react-pdf/renderer`), shareable social copy (AI-generated).
5. Supporters buy — orders tagged `store_id`, RLS ensures organizer dashboard only ever sees their own store's rows.
6. Nightly job computes `store_payouts`; on `end_at`, store auto-archives, final payout report emailed, Stripe Connect (or manual ACH) used to pay out net proceeds if MC wants automated payouts.
7. Organizer dashboard (web + mobile): live sales counter, top products, days-left countdown, "share your store" tools, payout status.

This directly replaces the current itemorder.com dependency and becomes a **recurring high-margin product** you can even white-label/sell to other print shops later.

---

## 8. Mobile App (Expo/React Native) — Feature Parity Plan

- Browse/search/PDP/cart/checkout (Apple Pay/Google Pay via Stripe), account & order history, push notifications (order status, fundraiser milestones, abandoned cart), AI chat assistant (same backend), barcode/QR scan to jump into a fundraiser store, camera upload for quote requests (photograph a logo/design on the spot), organizer dashboard for fundraiser hosts, wishlist, biometric login (Face ID/Touch ID via `expo-local-authentication`), deep linking (`mcreations://store/amity-2025`) + universal links for shared fundraiser links, offline-friendly cart (persisted, synced on reconnect).
- Shared code: 80%+ of business logic (API client, Zod schemas, hooks) lives in `packages/` and is imported by both `apps/web` and `apps/mobile` — only UI primitives differ (Tailwind/shadcn vs NativeWind).

---

## 9. Non-Functional Requirements

- **Performance**: Core Web Vitals green (LCP<2.5s), ISR/edge caching for catalog pages, image optimization (AVIF/WebP via CDN), DB indexes on all filter/sort columns + composite index for `(category_id, price)`, Redis cache for hot product/category queries.
- **SEO**: SSR/ISR product & category pages, JSON-LD (Product, Offer, Review, LocalBusiness, BreadcrumbList), sitemap.xml auto-generated, canonical URLs, OpenGraph (mirrors what Wix already had — don't regress).
- **Accessibility**: WCAG 2.1 AA, semantic HTML, keyboard nav, focus states, alt text pipeline (AI-assisted alt-text generation for product images as a nice bonus).
- **Security/Compliance**: PCI-DSS SAQ-A (Stripe handles card data), GDPR/CCPA-style data export/delete endpoints, RLS for tenant isolation, signed URLs for private uploads, rate-limiting + bot protection (Cloudflare Turnstile) on quote/auth forms.
- **Scalability**: stateless API pods behind a load balancer, horizontal worker scaling for jobs, read replicas for Postgres once traffic warrants, CDN in front of everything cacheable.

---

## 10. Delivery Roadmap

**Phase 0 — Foundations (2–3 wks)**: monorepo scaffold, CI/CD, auth, DB schema + migrations, design system, Docker dev env.
**Phase 1 — MVP Storefront (4–6 wks)**: catalog, PDP w/ variants, cart, Stripe checkout, order confirmation/email, basic admin (products/orders), CMS home/category pages replicating current site content.
**Phase 2 — Quotes + Fundraiser Stores (4–6 wks)**: RFQ workflow with uploads, admin quoting UI, multi-tenant store creation/dashboard, marketing-kit generation.
**Phase 3 — AI Layer (3–5 wks)**: RAG chatbot, semantic search, recommendations v1 (content-based), quote-estimation copilot.
**Phase 4 — Mobile App (parallel from Phase 1, ships after Phase 2)**: Expo app with full storefront + organizer dashboard + push.
**Phase 5 — Growth**: collaborative filtering recs, visual search, personalization preview, admin copilot, A/B testing, loyalty/referrals.

---

## 11. Suggested Team & Effort

Solo/small-team friendly given the modular monolith choice: 1 full-stack lead, 1 backend/AI engineer, 1 frontend/mobile engineer, part-time designer, part-time QA — MVP (Phase 0–1) realistically 6–9 weeks; full platform through Phase 4 ~4–6 months. (This is exactly the kind of build that benefits from AI coding agents doing the bulk of implementation under human review — see the harness doc.)

-- =========================================================
-- Midnight Creations USA — Core PostgreSQL Schema (v1)
-- Postgres 16+. Requires: pgcrypto, pgvector, citext
-- =========================================================
create extension if not exists pgcrypto;
create extension if not exists vector;
create extension if not exists citext;

-- =========================================================
-- 1. IDENTITY & ACCESS
-- =========================================================
create type user_role as enum ('customer','organizer','staff','admin','superadmin');

create table users (
  id                uuid primary key default gen_random_uuid(),
  email             citext unique not null,
  phone             text,
  password_hash     text,                -- null if OAuth-only
  first_name        text,
  last_name         text,
  role              user_role not null default 'customer',
  email_verified_at timestamptz,
  avatar_url        text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table oauth_accounts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references users(id) on delete cascade,
  provider       text not null,          -- 'google' | 'apple' | 'facebook'
  provider_uid   text not null,
  created_at     timestamptz not null default now(),
  unique (provider, provider_uid)
);

create table addresses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references users(id) on delete cascade,
  label        text,
  full_name    text not null,
  line1        text not null,
  line2        text,
  city         text not null,
  state        text not null,
  postal_code  text not null,
  country      text not null default 'US',
  phone        text,
  is_default   boolean not null default false,
  created_at   timestamptz not null default now()
);

-- =========================================================
-- 2. CATALOG
-- =========================================================
create table categories (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid references categories(id),
  slug        text unique not null,
  name        text not null,
  description text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create type print_method as enum ('screen_print','embroidery','sublimation','laser_engraving','dtf','vinyl');

create table products (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  name            text not null,
  description     text,
  base_price      numeric(10,2) not null,
  currency        text not null default 'USD',
  status          text not null default 'active', -- active|draft|archived
  is_customizable boolean not null default false,
  metadata        jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table product_categories (
  product_id  uuid references products(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create table product_print_methods (
  product_id   uuid references products(id) on delete cascade,
  print_method print_method not null,
  primary key (product_id, print_method)
);

-- Generic option system mirrors the site's filter facets
-- (Adult Size, Color, Lovey Style, Style, Size, Size-Adult Unisex, etc.)
create table product_options (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name       text not null,      -- 'Adult Size (unisex)', 'Color', 'Lovey Style'
  sort_order int not null default 0
);

create table product_option_values (
  id        uuid primary key default gen_random_uuid(),
  option_id uuid not null references product_options(id) on delete cascade,
  value     text not null,       -- '2XL', 'Blue Bunny', 'Black'
  sort_order int not null default 0
);

create table product_variants (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references products(id) on delete cascade,
  sku            text unique not null,
  price          numeric(10,2) not null,
  compare_at     numeric(10,2),
  weight_oz      numeric(8,2),
  inventory_qty  int not null default 0,
  option_values  jsonb not null default '{}', -- {"Color":"Black","Size":"Large"}
  image_url      text,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

create table product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url        text not null,
  alt_text   text,
  sort_order int not null default 0
);

-- On-PDP personalization (e.g. "Add Name", "Add Number")
create table personalization_fields (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references products(id) on delete cascade,
  label        text not null,
  field_type   text not null,   -- text|number|upload
  max_length   int,
  extra_price  numeric(10,2) not null default 0,
  is_required  boolean not null default false
);

create table product_bundle_items (
  bundle_product_id uuid not null references products(id) on delete cascade,
  item_product_id   uuid not null references products(id) on delete cascade,
  quantity          int not null default 1,
  primary key (bundle_product_id, item_product_id)
);

-- =========================================================
-- 3. MULTI-TENANT FUNDRAISER / TEAM / SCHOOL STORES
-- =========================================================
create type store_type as enum ('fundraiser','team','school','business');
create type store_status as enum ('pending','live','ended','archived');

create table stores (
  id                 uuid primary key default gen_random_uuid(),
  slug               text unique not null,
  name               text not null,
  type               store_type not null,
  status             store_status not null default 'pending',
  owner_user_id      uuid not null references users(id),
  account_manager_id uuid references users(id),
  commission_pct     numeric(5,2) not null default 10.00,
  goal_amount        numeric(10,2),
  theme              jsonb not null default '{}',  -- {logoUrl, primaryColor,...}
  starts_at          timestamptz,
  ends_at            timestamptz,
  created_at         timestamptz not null default now()
);

create table store_members (
  store_id  uuid references stores(id) on delete cascade,
  user_id   uuid references users(id) on delete cascade,
  role      text not null default 'organizer', -- organizer|co-organizer
  primary key (store_id, user_id)
);

create table store_products (
  id             uuid primary key default gen_random_uuid(),
  store_id       uuid not null references stores(id) on delete cascade,
  product_id     uuid not null references products(id),
  override_price numeric(10,2),
  is_exclusive   boolean not null default false
);

create table store_marketing_assets (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid not null references stores(id) on delete cascade,
  asset_type text not null,   -- qr_code|flyer_pdf|social_copy
  url        text,
  content    text,
  created_at timestamptz not null default now()
);

create table store_payouts (
  id           uuid primary key default gen_random_uuid(),
  store_id     uuid not null references stores(id) on delete cascade,
  period_start date not null,
  period_end   date not null,
  gross_sales  numeric(12,2) not null default 0,
  commission   numeric(12,2) not null default 0,
  net_payout   numeric(12,2) not null default 0,
  status       text not null default 'pending', -- pending|paid|failed
  paid_at      timestamptz,
  created_at   timestamptz not null default now()
);

-- =========================================================
-- 4. CART / CHECKOUT / ORDERS
-- =========================================================
create table carts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id),
  store_id   uuid references stores(id),
  session_id text,               -- guest carts
  currency   text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table cart_items (
  id              uuid primary key default gen_random_uuid(),
  cart_id         uuid not null references carts(id) on delete cascade,
  variant_id      uuid not null references product_variants(id),
  quantity        int not null check (quantity > 0),
  unit_price      numeric(10,2) not null,
  personalization jsonb not null default '{}',
  created_at      timestamptz not null default now()
);

create type order_status as enum (
  'pending_payment','paid','in_production','ready_for_pickup',
  'shipped','delivered','cancelled','refunded'
);

create table orders (
  id                 uuid primary key default gen_random_uuid(),
  order_number        text unique not null,
  user_id            uuid references users(id),
  store_id           uuid references stores(id),   -- null = direct retail
  status             order_status not null default 'pending_payment',
  subtotal           numeric(12,2) not null,
  tax_total          numeric(12,2) not null default 0,
  shipping_total     numeric(12,2) not null default 0,
  discount_total     numeric(12,2) not null default 0,
  grand_total        numeric(12,2) not null,
  currency           text not null default 'USD',
  shipping_address_id uuid references addresses(id),
  billing_address_id  uuid references addresses(id),
  fulfillment_method text not null default 'ship', -- ship|pickup
  placed_at          timestamptz not null default now(),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references orders(id) on delete cascade,
  variant_id      uuid not null references product_variants(id),
  quantity        int not null,
  unit_price      numeric(10,2) not null,
  personalization jsonb not null default '{}',
  print_method    print_method,
  created_at      timestamptz not null default now()
);

create table order_status_history (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references orders(id) on delete cascade,
  status     order_status not null,
  note       text,
  changed_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table payments (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references orders(id) on delete cascade,
  provider            text not null default 'stripe',
  provider_ref        text not null,     -- payment_intent id
  amount              numeric(12,2) not null,
  status              text not null,     -- succeeded|failed|refunded
  created_at          timestamptz not null default now()
);

create table shipments (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  carrier      text,
  tracking_no  text,
  label_url    text,
  shipped_at   timestamptz,
  delivered_at timestamptz
);

create table discounts (
  id           uuid primary key default gen_random_uuid(),
  code         citext unique not null,
  type         text not null,   -- percent|fixed
  value        numeric(10,2) not null,
  store_id     uuid references stores(id),  -- optional store-scoped discount
  starts_at    timestamptz,
  ends_at      timestamptz,
  max_uses     int,
  used_count   int not null default 0,
  is_active    boolean not null default true
);

-- =========================================================
-- 5. QUOTE / RFQ WORKFLOW
-- =========================================================
create type quote_status as enum ('submitted','ai_estimated','quoted','approved','rejected','converted','expired');

create table quote_requests (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references users(id),
  contact_name     text not null,
  contact_email    citext not null,
  contact_phone    text,
  organization     text,
  decoration_method print_method,
  garment_type     text,
  quantity         int,
  needed_by        date,
  notes            text,
  ai_extracted     jsonb,          -- structured fields the LLM parsed
  ai_price_estimate_low  numeric(10,2),
  ai_price_estimate_high numeric(10,2),
  status           quote_status not null default 'submitted',
  assigned_staff_id uuid references users(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table quote_attachments (
  id         uuid primary key default gen_random_uuid(),
  quote_id   uuid not null references quote_requests(id) on delete cascade,
  file_url   text not null,
  file_name  text,
  scanned_clean boolean default false,
  created_at timestamptz not null default now()
);

create table quote_line_items (
  id          uuid primary key default gen_random_uuid(),
  quote_id    uuid not null references quote_requests(id) on delete cascade,
  description text not null,
  quantity    int not null,
  unit_price  numeric(10,2) not null
);

create table quote_messages (
  id         uuid primary key default gen_random_uuid(),
  quote_id   uuid not null references quote_requests(id) on delete cascade,
  sender_id  uuid references users(id),
  body       text not null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 6. REVIEWS / CONTENT / WISHLIST
-- =========================================================
create table reviews (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id    uuid references users(id),
  rating     int not null check (rating between 1 and 5),
  title      text,
  body       text,
  ai_summary text,           -- LLM-generated pros/cons (admin-facing aggregate lives elsewhere)
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table wishlists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table wishlist_items (
  wishlist_id uuid references wishlists(id) on delete cascade,
  product_id  uuid references products(id) on delete cascade,
  primary key (wishlist_id, product_id)
);

create table cms_pages (
  id        uuid primary key default gen_random_uuid(),
  slug      text unique not null,
  title     text not null,
  blocks    jsonb not null default '[]',  -- ordered array of typed content blocks
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table email_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      citext unique not null,
  source     text,
  subscribed_at timestamptz not null default now()
);

-- =========================================================
-- 7. AI / SEARCH / PERSONALIZATION
-- =========================================================
create table product_embeddings (
  product_id uuid primary key references products(id) on delete cascade,
  embedding  vector(1536),         -- text embedding of title+description+tags
  updated_at timestamptz not null default now()
);
create index on product_embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create table user_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id),
  session_id text,
  event_type text not null,        -- view|add_to_cart|purchase|search|wishlist
  product_id uuid references products(id),
  metadata   jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index on user_events (user_id, created_at);
create index on user_events (product_id, event_type);

create table chat_conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id),
  channel    text not null default 'web', -- web|mobile
  started_at timestamptz not null default now(),
  ended_at   timestamptz
);

create table chat_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references chat_conversations(id) on delete cascade,
  role            text not null,   -- user|assistant|tool
  content         text not null,
  tool_calls      jsonb,
  created_at      timestamptz not null default now()
);

create table recommendation_cache (
  id          uuid primary key default gen_random_uuid(),
  context_key text not null,       -- 'user:<id>' | 'pdp:<product_id>' | 'cart:<cart_id>'
  product_ids uuid[] not null,
  generated_at timestamptz not null default now(),
  expires_at  timestamptz not null
);
create index on recommendation_cache (context_key);

-- =========================================================
-- 8. PRODUCTION / OPS
-- =========================================================
create type production_status as enum ('queued','printing','embroidering','engraving','qc','ready','shipped');

create table production_jobs (
  id            uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references order_items(id) on delete cascade,
  print_method  print_method not null,
  status        production_status not null default 'queued',
  assigned_to   uuid references users(id),
  started_at    timestamptz,
  completed_at  timestamptz
);

create table audit_logs (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references users(id),
  action     text not null,
  entity     text not null,
  entity_id  uuid,
  diff       jsonb,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 9. ROW-LEVEL SECURITY (multi-tenant fundraiser isolation)
-- =========================================================
alter table orders enable row level security;
alter table store_payouts enable row level security;
alter table store_products enable row level security;

-- Example policy: organizers only see rows for stores they belong to.
-- app sets: select set_config('app.current_user_id', $1, true);
create policy store_isolation_orders on orders
  using (
    store_id is null
    or store_id in (
      select store_id from store_members where user_id = current_setting('app.current_user_id', true)::uuid
    )
    or current_setting('app.current_role', true) in ('admin','superadmin','staff')
  );

create policy store_isolation_payouts on store_payouts
  using (
    store_id in (
      select store_id from store_members where user_id = current_setting('app.current_user_id', true)::uuid
    )
    or current_setting('app.current_role', true) in ('admin','superadmin','staff')
  );

-- =========================================================
-- 10. HELPFUL INDEXES
-- =========================================================
create index idx_products_status on products(status);
create index idx_variants_product on product_variants(product_id);
create index idx_orders_user on orders(user_id);
create index idx_orders_store on orders(store_id);
create index idx_quote_status on quote_requests(status);
create index idx_stores_slug on stores(slug);
create index idx_categories_parent on categories(parent_id);

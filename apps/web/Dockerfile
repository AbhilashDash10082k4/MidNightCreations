# ---- Stage 1: base image with Bun installed ----
FROM oven/bun:1 AS base
WORKDIR /app

# ---- Stage 2: prune the monorepo down to just what apps/web needs ----
FROM base AS pruner
RUN bun add -g turbo
COPY . .
RUN turbo prune web --docker

# ---- Stage 3: install dependencies (cached — only reruns if package.json changes) ----
FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN bun install

# ---- Stage 4: build the actual app ----
FROM base AS builder
COPY --from=installer /app/node_modules ./node_modules
COPY --from=pruner /app/out/full/ .
RUN bunx turbo build --filter=web

# ---- Stage 5: the final, small image that actually runs in production ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["bun", "apps/web/server.js"]
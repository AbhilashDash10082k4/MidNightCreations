# AGENTS.md — Read this before touching any code

## Mission

Build the Midnight Creations USA ecommerce platform per /docs/prd/*.md,
using: Next.js (web/admin)/ (api), PostgreSQL+Prisma (db -local), Expo+React Native (mobile).

## Ground rules

1. Never invent product/business requirements — if a PRD is silent or ambiguous,
   write a question into `tasks/review/BLOCKED-<task-id>.md` and stop that task.
   Do not guess and proceed on anything touching: pricing, payments, tenant
   data isolation, auth, or PII handling.
3. Every change must pass `.agent/scripts/verify.sh` locally before you mark a
   task "ready for review". If it doesn't pass, the task is not done — keep
   iterating, don't report partial success as success.
4. Follow `/docs/api-contracts/` exactly. If your implementation needs the
   contract to change, propose the diff in the task file and stop; do not
   silently diverge FE/BE.
5. All DB schema changes go through Prisma migrations (`pnpm db:migrate:dev`)
   — never hand-edit the database, never use `db push` in anything other than
   a scratch/local branch.
6. Multi-tenant rule: ANY query touching `orders`, `store_payouts`,
   `store_products`, or other tenant-scoped tables MUST go through the
   repository layer that sets `app.current_user_id`/`app.current_role`
   (see packages/db/src/tenant-context.ts) so Postgres RLS applies. Raw
   Prisma calls that bypass this layer are a P0 defect.
7. Never commit secrets. Use `.env.example` placeholders. If you need a new
   secret, add its NAME (not value) to `.env.example` and note it in the task.
8. Write tests in the same PR/commit as the feature, not after. Minimum:
   unit tests for business logic, integration test for each new API route,
   one Playwright E2E for each new user-facing flow.
9. Commit messages: `<type>(<scope>): <summary>` (Conventional Commits).
   One logical change per commit. 

## Tech constraints (do not deviate without an ADR)

- Web: Next.js App Router, TypeScript strict mode, Tailwind + shadcn/ui.
- API: Nextjs backend, tRPC for internal, REST/OpenAPI for public+mobile.
- Follow this architecture -> request from Frontend -> route-> controller -> services(where the business logic resides) -> validator-> repository (interacting with the data)
- DB: PostgreSQL 16 local via Docker Compose, Prisma ORM, RLS for tenancy.
- Mobile: Expo (managed workflow) + Expo Router + NativeWind.
- Validation: Zod schemas in packages/shared-types, imported everywhere —
  never redefine a shape that already exists there.
- No new dependency without checking packages/config for an existing
  equivalent first, and noting the addition + reason in the task file.

## Definition of done (see .agent/checklists/definition-of-done.md)

A task is NOT done until every box in that checklist is checked.

## Escalation

If you are blocked, uncertain about a business rule, or a test is flaky for
reasons you can't fix in <30 min, STOP and write to tasks/review/BLOCKED-*.md
with: what you tried, what you observed, what decision you need. Do not loop
silently for hours making unverified guesses.

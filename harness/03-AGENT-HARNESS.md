# Coding-Agent Harness — Build System for the MC Ecommerce Platform

Goal: let one or more AI coding agents (Claude Code, Cursor, etc.) build most of the
platform in `01-PLATFORM-PLAN.md` with **minimal human babysitting** and **maximal
verifiability**. The harness = repo scaffolding + role prompts + task format +
automated gates an agent cannot skip. Nothing here is Claude-specific magic —
it's a spec-driven development loop any capable coding agent can run inside.

---

## 1. Guiding principle

> **An agent is only as reliable as the tests, specs, and checklists you make it run against.**

We never ask an agent to "build the ecommerce platform." We give it:

1. A **spec** (small, unambiguous, one vertical slice).
2. **Acceptance criteria** it can mechanically check (tests, lint, typecheck, a curl script).
3. A **definition of done** checklist.
4. A place to **report status** the next agent/human can read without re-deriving context.

---

## 2. Repo scaffolding the harness needs

```
mcreations/
├── AGENTS.md                     # top-level constitution for any agent (see §3)
├── CLAUDE.md                     # symlink or copy of AGENTS.md (Claude Code reads this)
├── docs/
│   ├── adr/                      # Architecture Decision Records, one file per decision
│   │   └── 01-multi-tenant-rls.md
│   ├── prd/                      # Product specs, one per module (source of truth)
│   │   ├── catalog.md
│   │   ├── checkout.md
│   │   ├── quotes.md
│   │   ├── fundraiser-stores.md
│   │   ├── ai-assistant.md
│   │   └── mobile-app.md
│   └── api-contracts/            # OpenAPI/tRPC contracts, versioned, agent must not diverge
├── tasks/
│   ├── backlog/                  # not started — TASK-XXXX.md files
│   ├── in-progress/
│   ├── review/                   # agent finished, awaiting human/agent review
│   └── done/
│   └── TEMPLATE.md
├── .agent/
│   ├── roles/
│   │   ├── planner.md
│   │   ├── implementer.md
│   │   ├── reviewer.md
│   │   ├── tester.md
│   │   └── security-auditor.md
│   ├── checklists/
│   │   ├── definition-of-done.md
│   │   ├── pr-checklist.md
│   │   └── db-migration-checklist.md
│   └── scripts/
│       ├── verify.sh             # one command = full gate (lint+types+tests+build)
│       ├── new-task.sh
│       └── seed-dev-db.sh
├── apps/ packages/ infra/ ...    # from §3 of the platform plan
└── .github/workflows/agent-ci.yml
```

Every folder above exists **on day 1**, before any feature code — the harness is the
first thing built, by a human or a bootstrap agent run.

---

## 3. `AGENTS.md` — the constitution every agent reads first

This file is the single most important artifact. Put it at repo root. Content:

```markdown
# AGENTS.md — Read this before touching any code

## Mission

Build the Midnight Creations USA ecommerce platform per /docs/prd/*.md,
using: Next.js (web/admin), NextJS (api), PostgreSQL+Prisma (db), Expo (mobile).

## Ground rules

1. Never invent product/business requirements — if a PRD is silent or ambiguous,
   write a question into `tasks/review/BLOCKED-<task-id>.md` and stop that task.
   Do not guess and proceed on anything touching: pricing, payments, tenant
   data isolation, auth, or PII handling.
2. Work ONE task file at a time from `tasks/in-progress/`. Never start a task
   that isn't there — move it from backlog first (`.agent/scripts/new-task.sh`).
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
   One logical change per commit. Reference the task id: `TASK-0123`.
10. When a task is done, move its file to `tasks/review/` and fill in the
    "Agent Report" section (what changed, how it was tested, any follow-ups).

## Tech constraints (do not deviate without an ADR)

- Web: Next.js App Router, TypeScript strict mode, Tailwind + shadcn/ui.
- API: NestJS + Fastify adapter, tRPC for internal, REST/OpenAPI for public+mobile.
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
```

---

## 4. Task file format (the unit of work)

`.agent/scripts/new-task.sh` copies `tasks/TEMPLATE.md` into `backlog/TASK-XXXX.md`:

```markdown
# TASK-0142: Add cart_item personalization validation

## Context

Links: /docs/prd/catalog.md#personalization, /docs/api-contracts/cart.yaml
Depends on: TASK-0110 (product_options schema), TASK-0121 (cart API skeleton)

## Spec (what "done" means, precisely)

- POST /v1/cart/:id/items validates `personalization` against the product's
  `personalization_fields` (required fields present, max_length respected,
  field_type enforced) before insert.
- Invalid personalization returns 422 with a field-level error shape matching
  packages/shared-types/src/errors.ts::ValidationError.
- Extra price from personalization_fields.extra_price is added to unit_price
  at insert time (server computes price, client never sends price).

## Out of scope

- Live visual mockup preview (that's TASK-0201).
- Personalization on order edit after payment (not supported v1).

## Acceptance criteria (must all be automatable)

- [ ] Unit tests: apps/api/src/cart/*.spec.ts covering valid/invalid/missing/
      over-length/wrong-type personalization inputs (≥6 cases).
- [ ] Integration test: apps/api/test/cart.e2e-spec.ts hits the real route
      against the test DB and asserts 201 vs 422 paths.
- [ ] `pnpm --filter api test` and `pnpm --filter api test:e2e` pass.
- [ ] `pnpm verify` (root) passes clean.
- [ ] No change to /docs/api-contracts/cart.yaml required (if it is required,
      stop and flag — see AGENTS.md rule 4).

## Agent Report (fill this in when moving to review/)

- Files changed:
- Tests added/run and result:
- Deviations from spec (if any) and why:
- Follow-up tasks created (if any):
```

Why this shape: **spec + explicit out-of-scope + machine-checkable acceptance
criteria** is what prevents an agent from "helpfully" wandering into unrelated
files or declaring victory on vibes.

---

## 5. Agent roles (use as separate agent sessions/subagents, or as explicit

mode-switch prompts within one session)

### Planner (`.agent/roles/planner.md`)

Input: a PRD file from `/docs/prd/`. Output: a set of `TASK-XXXX.md` files in
`backlog/`, each independently completable in <1 day, with dependencies noted.
Rules: no task without acceptance criteria; slice vertically (one thin
end-to-end feature) not horizontally (not "build all models" then "build all
routes"); flag any task that touches payments/PII/tenancy as `risk: high` in
its frontmatter so it gets mandatory human review.

### Implementer (`.agent/roles/implementer.md`)

Input: one task file moved to `in-progress/`. Output: code + tests + updated
task file moved to `review/`. Rules: run `verify.sh` before claiming done;
never touch files outside the task's stated scope; if the task depends on an
unfinished task, stop and say so instead of stubbing around it silently.

### Reviewer (`.agent/roles/reviewer.md`)

Input: a task in `review/`. Output: either move to `done/` with a very short
review note, or move back to `in-progress/` with specific requested changes
appended under a `## Review Feedback` heading. Checks against
`.agent/checklists/pr-checklist.md` line by line — does not rubber-stamp.
Specifically re-runs `verify.sh` itself rather than trusting the implementer's
report.

### Tester / QA (`.agent/roles/tester.md`)

Runs after a batch of tasks land on a feature branch. Executes Playwright
E2E suite + a manual exploratory pass against `docs/prd/*` "Acceptance
criteria" sections not covered by automated tests (e.g. visual/UX quality).
Files bug tasks back into `backlog/` using the same TASK template.

### Security Auditor (`.agent/roles/security-auditor.md`)

Runs on any task touching: auth, payments, file uploads, RLS/tenant
isolation, or admin routes. Checklist includes: input validation on every
new route, authz check present (not just authn), RLS policy covers the new
table if tenant-scoped, no secrets/PII in logs, file uploads are
type/size/AV-scanned before being readable by staff, rate limiting present
on public write endpoints.

> Practically: these can be 5 separate Claude Code / Cursor sessions each
> loaded with only their role file + the relevant task/PRD, or 5 explicit
> phases you run one agent through sequentially. Separating them is what
> gives you an actual review gate instead of the same context marking its
> own homework.

---

## 6. Automated gates (`.agent/scripts/verify.sh`)

```bash
#!/usr/bin/env bash
set -euo pipefail
echo "==> Formatting check"; pnpm format:check
echo "==> Lint";             pnpm lint
echo "==> Typecheck";        pnpm typecheck
echo "==> Unit tests";       pnpm test
echo "==> Prisma migration drift check"; pnpm db:migrate:diff --exit-code
echo "==> Build";            pnpm build
echo "==> API integration tests"; pnpm --filter api test:e2e
echo "==> All green ✅"
```

This is the ONE command every agent role must run before declaring a task
done, and it's also the CI job (`.github/workflows/agent-ci.yml`) that runs
on every PR — so an agent cannot "pass" locally by skipping a step that CI
would catch. CI failure automatically reopens the task (bot moves the file
back to `backlog/` and comments why).

`db-migration-checklist.md` additionally forces: migration is reversible or
explicitly marked destructive + approved by a human, migration tested against
seeded data (`seed-dev-db.sh`), RLS policies updated if a new tenant-scoped
table was added.

---

## 7. Definition of Done (`.agent/checklists/definition-of-done.md`)

```markdown
- [ ] Code compiles, typechecks, lints clean (pnpm verify passes)
- [ ] Unit tests cover happy path + at least 2 edge/error cases
- [ ] Integration/E2E test added for any new API route or user flow
- [ ] No `any`, no `// @ts-ignore` without a linked follow-up task
- [ ] All user input validated with a Zod schema from packages/shared-types
- [ ] Auth + authorization checked at the route (not just UI-hidden)
- [ ] Tenant-scoped data goes through the RLS-aware repository layer
- [ ] No secrets committed; new env vars added to .env.example
- [ ] API contract file updated if request/response shape changed
- [ ] Task file moved to review/ with Agent Report filled in
- [ ] If touching pricing, tax, payments, or payouts: numbers verified with
      a hand-computed example in the task report, not just "tests pass"
```

---

## 8. Working loop (how you actually run this day to day)

1. **Human** (or Planner agent) takes a PRD → runs Planner → gets 10–30 task
   files in `backlog/`.
2. **Human** reviews/reorders backlog once, flags any `risk: high` tasks for
   mandatory pairing rather than full autonomy.
3. **Implementer agent** picks the next unblocked task (respecting `Depends
on:` — a `new-task.sh --next` script can pick this automatically), moves
   it to `in-progress/`, implements, runs `verify.sh`, moves to `review/`.
4. **Reviewer agent (fresh context)** re-verifies, either approves → `done/`
   - opens a PR, or bounces back with specific feedback.
5. Human merges PRs in small batches; **Tester agent** runs the E2E suite
   against the merged branch weekly or per-milestone; **Security Auditor**
   runs on every `risk: high` task and before each release tag.
6. Repeat per module in the roadmap order from `01-PLATFORM-PLAN.md` §10
   (Foundations → MVP Storefront → Quotes/Fundraiser Stores → AI Layer →
   Mobile → Growth).

This turns "build me an ecommerce platform" into a queue of ~150–300 small,
independently verifiable tasks with two automated and one human checkpoint
per task — which is what actually makes agent-built code production-grade
rather than plausible-looking.

---

## 9. Bootstrapping prompt (what you paste into the first agent session)

```
You are the Planner + Bootstrap agent for the Midnight Creations USA
ecommerce platform. Read AGENTS.md fully first.

Step 1: Scaffold the monorepo exactly as described in AGENTS.md and
01-PLATFORM-PLAN.md §3 (Turborepo, pnpm workspaces, apps/{web,admin,mobile,api},
packages/{db,shared-types,api-client,ui,ui-native,config}), with a working
`pnpm verify` that passes on the empty scaffold (even if it just typechecks
and runs a placeholder test).

Step 2: Set up Docker Compose (postgres, redis, mailhog, minio) and Prisma
pointed at it, and load 02-DATABASE-SCHEMA.sql as the initial migration.

Step 3: Create the docs/prd/*.md files by summarizing the relevant sections
of 01-PLATFORM-PLAN.md into implementation-ready PRDs (one per module).

Step 4: Act as Planner on docs/prd/catalog.md and docs/prd/checkout.md only
(Phase 0-1 of the roadmap) and populate tasks/backlog/ with the resulting
task files. Stop there and report back before implementing anything.

Do not skip ahead to writing feature code. Do not invent requirements not
present in the linked docs — flag gaps instead.
```

---

## 10. Notes on model/agent choice

- Use a strong reasoning model for **Planner/Reviewer/Security-Auditor**
  roles (accuracy on judging correctness matters more than speed there).
- Implementer role can use a faster/cheaper model for bulk of tasks, with
  Reviewer as the quality gate — this is the cost-efficient split.
- Keep each agent session scoped to one task + its role file + linked
  PRD/contract — do not load the entire repo history into context; the
  task file + `docs/` + the specific package being touched is enough and
  keeps the agent from getting distracted or hallucinating unrelated context.

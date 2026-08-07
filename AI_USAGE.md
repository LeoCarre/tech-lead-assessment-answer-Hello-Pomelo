# AI Usage

This document records the use of AI during the assessment.

## Tools

- Cursor (Composer / Auto agent)
- Project context and skills under `.cursor/` (local only, gitignored)
- Reference: [google-labs-code/design.md](https://github.com/google-labs-code/design.md) for `DESIGN.md` structure
- Brand tokens extracted from [hello-pomelo.com](https://hello-pomelo.com/)
- UI shell patterns adapted from a private Horrea Estimation Platform layout (sidebar inset + sticky header)

## What AI was used for

- Requirement analysis from `consignes.pdf` and `.cursor/context.md`
- Drafting `DESIGN.md` (YAML tokens + prose) aligned with Hello Pomelo
- Scaffolding Next.js app structure and assessment shell
- Q1: customer history domain (cents, periods, anomalies, normalization) + dashboard UI + Vitest
- Q2: phased pricing engine, shop/workbench sync, HT/TTC tax breakdown + Vitest
- Q3: portal architecture doc, multi-environment dashboard, Clerk SSO (`auth.protect`)
- README rewrite and Conventional Commits history reconstruction
- Coolify-oriented Dockerfile

## Human review required

- Business-rule interpretation (window start at UTC midnight, evolution `null` when previous total is 0)
- Rejection of shipping proprietary brand webfonts; Google Fonts stand-ins documented in `DESIGN.md`
- Confirmation that rhythm threshold remains strict `>` (12 orders / 6 months → monthly)
- Pricing phase order and re-evaluation bounds
- Soft vs hard SSO (hard protect on `/dashboard` when Clerk keys are present)
- Verification that tests and `npm run build` pass before considering a question done

## Rejected or changed AI suggestions

- Full Clerk/Supabase auth stack from the Horrea reference early on — deferred until Q3, then Clerk only
- Middleware-only `createRouteMatcher` protection — migrated to resource-based `auth.protect()` in the dashboard layout
- Relying on `Date.now()` for the six-month window — replaced with injectable fixed reference date
- Treating missing customer `type` as a crash — normalized to `Unknown` at the data boundary
- Including express fees in HT (broke strikethrough UX) — HT excludes final fees

## Intended ongoing workflow

1. Understand the requirement
2. Document assumptions
3. Implement a small logical change
4. Run tests / typecheck / build
5. Human review
6. Commit with Conventional Commits (`type(scope): description`)

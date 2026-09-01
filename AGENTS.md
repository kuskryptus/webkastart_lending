<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project map

WebkaStart is a Slovak Next.js 16 App Router site. It uses React 19, TypeScript,
Tailwind CSS 4, PostgreSQL via `postgres`, private S3-compatible storage, Resend,
and pnpm.

- Public landing page: `app/page.tsx` and `components/`.
- Contact API: `app/api/contact/route.ts`.
- Core onboarding wizard: `app/start/[token]`, `components/onboarding/`, and
  `app/api/onboarding/[token]`. Discovery 2 uses `/start/discovery/[token]` and
  `/api/onboarding/discovery/[token]`.
- Password-protected onboarding management: `app/start`, with project details at
  `app/start/admin/[projectId]` and admin APIs under `app/api/onboarding/admin`.
- Onboarding persistence, validation, auth, and storage boundaries:
  `lib/onboarding/`.
- PostgreSQL schema: ordered migrations under `migrations/`; migration 002 adds
  clients, client-level assets, and Discovery 2 without rewriting Core answers.
- Deployment and environment setup: `DEPLOYMENT.md` and `.env.example`.

## Onboarding invariants

- Client links contain a cryptographically random bearer token; only its SHA-256
  hash is stored. Never expose `token_hash` or private object keys to clients.
- Onboarding pages and APIs are private/noindex. Admin reads and downloads must
  verify the HttpOnly admin session server-side.
- Uploads stay private, keep original bytes, use UUID object keys, and use
  short-lived signed URLs. The server validates type, size, count, and signature.
- A client may own multiple forms. Core and Discovery 2 have separate bearer
  tokens and persistence; never merge or overwrite one form's answers with another.
- Answers remain structured according to their form types; sanitize all writes at
  the API boundary so the future AI boundary remains stable.

## Verification

Run `pnpm typecheck`, `pnpm lint`, and `pnpm build`. Database setup and the exact
production onboarding flow are documented in `DEPLOYMENT.md`.

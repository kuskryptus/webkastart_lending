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
- Public consultation booking: `/rezervacia`, backed by `/api/bookings` and the
  `consultation_bookings` table. The authenticated Team Go integration lives at
  `/api/team-go/bookings`; its contract is documented in
  `docs/TEAM_GO_BOOKING_API.md`.
- Shared client workspace: the permanent bearer link is `/portal/[token]`, backed
  by `/api/portal/[token]`. Core, Discovery 2, and files use the same records as
  admin; legacy `/start/[token]` and Discovery links remain compatible.
- Password-protected onboarding management: `app/start`, with project details at
  `app/start/admin/[projectId]` and admin APIs under `app/api/onboarding/admin`.
- Onboarding persistence, validation, auth, and storage boundaries:
  `lib/onboarding/`.
- PostgreSQL schema: ordered migrations under `migrations/`; migration 003 adds
  clients, client-level assets, Discovery 2, and the shared workspace without
  rewriting Core answers. Migration 004 preserves previously issued portal tokens
  for lookup and, when available, admin re-copy. Migration 005 adds the fast-choice
  and structured product fields while retaining the original Discovery text columns.
  Migration 007 separates client source materials from admin deliverables,
  migration 008 adds comments anchored to shared images, and migration 010 adds
  a reversible resolved state to those comments.
- Deployment and environment setup: `DEPLOYMENT.md` and `.env.example`.

## Onboarding invariants

- Each client has one canonical portal link signed from its client ID with
  `ONBOARDING_PORTAL_LINK_SECRET` (falling back to the admin secret); keep that
  secret stable. Existing random bearer links remain valid through hash lookup.
  Never expose token hashes or private object keys to clients.
- Onboarding pages and APIs are private/noindex. Admin reads and downloads must
  verify the HttpOnly admin session server-side.
- Uploads stay private, keep original bytes, use UUID object keys, and use
  short-lived signed URLs. Files above 64 MB use resumable S3 multipart upload;
  the server validates type, size, part completeness, count, and signature.
  Browser upload URLs must not sign `Content-Length`; browsers control that
  header and the server verifies the uploaded object size before accepting it.
  Keep the S3 client's `requestChecksumCalculation` at `WHEN_REQUIRED`: newer
  AWS SDK versions otherwise sign an empty-body CRC32 into browser upload URLs.
- A client may own multiple forms. Core and Discovery 2 keep separate persistence
  (and legacy form-specific tokens) behind the shared portal token; never merge or
  overwrite one form's answers with another.
- Admin and portal are presentations over the same Core, Discovery, and asset
  rows. Respect `client_workspace_sections`; internal notes are never client-visible.
  Assets with category `source` are client inputs; `deliverable` assets are admin
  outputs shown in the separate client download section.
- Return signed asset redirects through `privateRedirect`; native
  `Response.redirect()` has immutable headers and cannot be hardened afterward.
- Individual image share links use an HMAC of the asset ID and expose only that
  client-visible file through `/subor/[assetId]/[shareToken]`; keep the signing
  secret stable and re-check file and section visibility on every shared read.
  Image comments use normalized coordinates in `shared_image_comments`, are
  available only through the same bearer link, and must preserve that validation.
- Core and Discovery writes use their monotonic `revision` for optimistic locking.
  A stale writer must receive 409 and must never overwrite a newer record.
- Core prefill metadata is keyed by canonical field paths in `fieldMetadata`; the
  values remain in their original answer fields. Reconcile client metadata
  server-side and never trust client-supplied source labels.
- Fast-choice fields are additive. Keep the legacy free-text fields readable and
  writable so existing client answers survive new saves without a data rewrite.
- Core answers keep the creative-strategy, project-success, and collaboration
  questions in JSON. `designPreferences` and `designOther` retain the original
  visual-direction answers after the feeling question rewording;
  `customerConcerns`, `desiredCustomerReaction`, and `brandFirstImpression` are
  additive discovery fields and must remain available to exports;
  `representativePhotoIds` may reference at most five existing uploaded images and
  must not create a second upload flow.
- Answers remain structured according to their form types; sanitize all writes at
  the API boundary so the future AI boundary remains stable.

## Booking invariants

- Public slots use the configured Bratislava-local weekly schedule, lead time,
  window, and one fixed duration. Always revalidate a selected slot server-side.
- Booking creation takes a PostgreSQL advisory transaction lock and checks time
  overlap before insert; never weaken this to a client-only availability check.
- Team Go endpoints require `BOOKING_API_KEY`. Never expose that key in public
  client code. Use `externalId` for idempotent Team Go creation and preserve
  cancelled records so incremental synchronization can observe status changes.

## Verification

Run `pnpm typecheck`, `pnpm lint`, and `pnpm build`. Database setup and the exact
production onboarding flow are documented in `DEPLOYMENT.md`.

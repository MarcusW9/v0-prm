# PRM (Partner Relationship Management)

Internal prototype for managing seller partner relationships across acquisition, onboarding, and account management pipelines.

## Changelog

### Deployment Fix

- Deployments were failing in about 3 seconds with `Cannot find module '/vercel/path0/.v0/inject-built-with-v0.mjs'`. `vercel.json` set a `buildCommand` that ran that script before `next build`, but the `.v0/` folder is not in the repository, so Git-triggered builds exited before the app was built.
- Removed `vercel.json`. Vercel now uses the default `next build`, which already passes locally. The only thing lost is the optional "built with v0" badge injection.

### Console Error Fixes

- Removed references to icon files that did not exist (`/icon-light-32x32.png`, `/icon-dark-32x32.png`, `/apple-icon.png`) from `app/layout.tsx`, which caused 404s on every page load. Added `app/icon.svg`, which Next.js serves as the favicon automatically.
- Added `suppressHydrationWarning` to the `<html>` tag in `app/layout.tsx`. The hydration warning was caused by browser extensions injecting attributes into `<html>`, not by app code.
- The `/auth/login` 404s in the logs are not requested by app code (there is no auth route in this prototype), so they were left as is.

### Mock Data Anonymisation

Replaced all seller, contact, and SAM manager details in `lib/data/mock-sellers.ts` with generated, fictional data to protect real sellers and staff:

- Company names, contact names, and emails are now fictional (all emails use the reserved `example.com` domain).
- Company registration numbers are sequential placeholders (`10000001`–`10000018`).
- SAM managers renamed to "Alex Morgan" and "Jordan Lee"; notes, file names, and uploader/status-change attributions updated to match.
- Pipeline stages, scores, statuses, and dates are unchanged, so all UI behaviour is the same.

Note: previous commits in git history still contain the original data.

### Seller Management Tab

Added a **Management** tab to the seller detail page (`app/dashboard/partners/[id]/page.tsx`) with:

- **Seller Information editing** — update contact name, contact email, and SAM manager assignment inline, with a save action that only appears once a change is made.
- **Lifecycle Status Actions** — a visually de-emphasized, collapsible section (separate from routine edits) to mark a seller as **Delayed**, **Terminated**, or **Reactivated**:
  - Requires a reason (from a controlled list) and supporting notes before a status change can be confirmed.
  - Shows a confirmation dialog before applying the change.
  - Maintains a status history log with timestamps and the user who made the change.
- **Status badges** — Delayed (amber) and Terminated (red) badges now surface in the page header when a seller is not active.

Data model changes in `lib/types/seller.ts`: added `SellerStatus`, `DelayedReason`, `TerminatedReason`, `StatusChangeRecord`, and corresponding fields on `Seller`. Mock data in `lib/data/mock-sellers.ts` updated with status fields and reason option lists.

New component: `components/seller-management/management-tab.tsx`.

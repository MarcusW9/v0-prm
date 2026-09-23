# PRM (Partner Relationship Management)

Internal prototype for managing seller partner relationships across acquisition, onboarding, and account management pipelines.

## Changelog

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

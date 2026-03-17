# Sprint 5 — Polish, UX, and Launch (Tailwind + shadcn/ui)

**Purpose:** deliver a clean, consistent, accessible, launch-ready UI using **TailwindCSS + shadcn/ui** (Option B).

This plan is written to be executable. Each phase includes:
- concrete tasks
- target files/pages
- acceptance criteria
- checkpoints (what to verify before moving on)

> Scope note: This focuses on UX + UI polish. Observability/E2E/security items remain in Sprint 4.

---

## ✅ Definition of Done (Sprint 5)

### UX DoD
- Consistent layout across `/dashboard`, `/history`, `/settings/*`.
- All primary actions have clear **loading**, **success**, and **error** states.
- Quota/billing messaging is calm, consistent, and non-blocking until needed.
- Mobile works (no horizontal overflow; layout stacks gracefully).

### Accessibility DoD (minimum)
- Keyboard navigation works everywhere (Tab order + visible focus).
- No interactive element relies on color alone.
- Contrast is reasonable (aim WCAG AA).
- Respects `prefers-reduced-motion`.

### Engineering DoD
- `npm run lint`, `npm run build`, `npm test` are green.
- UI changes are made through components (not page-by-page ad-hoc styling).

---

## Phase 0 — UI foundation audit (0.5 day)

### Goals
- Confirm current UI patterns and identify where to standardize.

### Tasks
- Inventory pages:
  - `/dashboard`
  - `/history`
  - `/settings/profile`
  - `/settings/billing`
  - `/login`
  - marketing pages (to be created): `/` and `/pricing`
- Capture current UX gaps:
  - inconsistent spacing/typography
  - missing empty/loading states
  - error UX (quota exceeded)

### Deliverables
- A short checklist in this document marked ✅ / ❌ per page.

### Current baseline (as of 2026-03-17)

| Area | Status | Notes |
|---|---|---|
| `/dashboard` | ⚠️ needs polish | Functional, but uses raw Tailwind/HTML elements; error/quota UX is plain text. |
| `/history` | ⚠️ needs polish | Functional search/save/regenerate, but layout is custom; split view needs componentization. |
| `/settings/profile` | ⚠️ needs polish | Functional form but lacks component styling + clearer save feedback. |
| `/settings/billing` | ⚠️ needs polish | Functional but needs real SaaS “plan card” UI + consistent quota messaging. |
| `/login` | ⚠️ needs polish | Works, but UI should match new shell/components. |
| Marketing (`/`, `/pricing`) | ✅ exists / ⚠️ needs polish | Pages exist; must be aligned to Theme UI/UX guide + add SEO metadata. |

### Acceptance criteria
- We can answer: “What is our standard page layout and component set?”

### Phase 0 complete when
- This baseline table exists (above) and Sprint 5 decisions (theme/toasts/nav) are locked.

---

## Phase 1 — Install + configure shadcn/ui (0.5–1 day)

### Goals
- Adopt shadcn/ui conventions so UI is component-driven.

### Tasks
- Ensure Tailwind is configured properly (already present).
- Add shadcn/ui base:
  - `components.json`
  - `src/components/ui/*` generated components
- Set theme tokens:
  - `--radius` ~ 12px
  - primary color aligned to `docs/THEME_UI_UX.md` (indigo/violet)
- Ensure dark mode strategy is consistent (prefer Tailwind `class`).

### Recommended initial shadcn components
Start with the smallest set that covers all current pages:
- `button`, `input`, `textarea`, `label`
- `card`, `badge`, `separator`
- `tabs` (optional but useful in settings)
- `dropdown-menu` (user menu)
- `toast` (sonner) OR `alert` + inline messages
- `dialog` (optional: upgrade modal)

### Target files
- `src/app/globals.css` (shadcn tokens)
- `tailwind.config.*`
- `src/components/ui/*`

### Acceptance criteria
- A simple shadcn `Button` renders in an existing page.
- No significant visual regressions.

### Checkpoint
- Run lint/build/tests.

---

## Phase 2 — Design system primitives (1 day)

### Goals

- Centralize layout + repeated UI patterns.
- Reduce per-page bespoke Tailwind markup and use consistent primitives.

### Tasks
Create lightweight wrappers (not over-engineered):

- `PageShell` (container + consistent padding)
- `PageHeader` (title/description/actions)
- `InlineMessage` (info/success/error)
- `EmptyState` (empty + call-to-action)
- `LoadingState` (simple loading text; upgrade to skeleton later)

### Suggested directory layout

- `src/components/app/PageShell.tsx`
- `src/components/app/PageHeader.tsx`
- `src/components/app/InlineMessage.tsx`
- `src/components/app/EmptyState.tsx`
- `src/components/app/LoadingState.tsx`

### Acceptance criteria

- `/dashboard` and `/history` share the same header + container styling.
- Empty/loading states are consistent across pages.

### Status (Completed)

- Implemented the primitives listed above.
- Adopted them across `src/app/(app)/dashboard`, `src/app/(app)/history`, `src/app/(app)/settings/profile`, `src/app/(app)/settings/billing`.
- Verified: `npm test` ✅ and `npm run build` ✅.


## Phase 3 — App navigation + consistent layout (1 day)

### Status (Completed)

- Canonical app pages now live under the `(app)` route group and are wrapped by `src/app/(app)/layout.tsx` → `AppShell`.
- Side-nav is implemented in `src/components/app/AppShell.tsx` with active link styling and a working theme toggle.
- Verified: `npm test` ✅ and `npm run build` ✅.
- Dev smoke: `/dashboard`, `/history`, `/settings/profile`, `/settings/billing` render under auth middleware and redirect to `/login` when not authed.

### Goals
- Make the app feel cohesive with predictable navigation.

### Tasks
- Implement a top nav (simple, clean):
  - Links: Dashboard, History, Profile, Billing
  - Active state
  - Optional: user menu (later)
- Standardize margins (`max-w-*`, padding, vertical rhythm).

### Target pages
- `src/app/dashboard/page.tsx`
- `src/app/history/page.tsx`
- `src/app/settings/profile/page.tsx`
- `src/app/settings/billing/page.tsx`

### Acceptance criteria
- Every authenticated page shares the same shell.
- Mobile nav doesn’t break layout.

---

## Phase 4 — Dashboard UX polish (1–1.5 days)

### Goals
- Improve time-to-value on the core Generate loop.

### Tasks
- Upgrade generate form:
  - Use shadcn `Card`, `Textarea`, `Button`
  - Better tone/length controls (segmented/tabs/select)
  - Add helper text (“Paste the email you received”) + privacy microcopy
- Output panel improvements:
  - A dedicated output card
  - Sticky action bar: Copy, Save, Regenerate (if applicable)
  - Toast on copy success
- Quota UX improvements:
  - Replace raw error string with a shadcn `Alert` + “Upgrade” button
  - Show quota badge consistently

### Acceptance criteria
- Generate CTA is clearly primary.
- Errors look intentional and helpful.
- Copy feedback is visible.

---

## Phase 5 — History UX polish (1–1.5 days)

### Goals
- Make history feel like a tool: search, save, regenerate are easy.

### Tasks
- List UI:
  - Use `Card` + `Button` row actions
  - Show saved state with a `Badge` or icon button
  - Improve preview readability
- Details panel:
  - Use tabs: “Email” / “Reply” (optional)
  - Group action buttons (Save, Copy, Regenerate)
- Search UX:
  - Add clear empty state (“No matches for …”)
  - Optional: debounce search input

### Acceptance criteria
- User can manage saved items quickly.
- No awkward scrolling/overflow on mobile.

---

## Phase 6 — Settings UX polish (Profile + Billing) (1 day)

### Profile (`/settings/profile`)
- Use `Label` + `Input` + `Textarea`
- Save button states:
  - disabled while saving
  - success toast
  - inline error message

### Billing (`/settings/billing`)
- Plan card UI (Free vs Pro)
- Clear CTA copy
- Display current plan and quota in a consistent way

### Acceptance criteria
- Profile feels safe and “form-like” (not raw inputs).
- Billing page looks like a real SaaS settings page.

---

## Phase 7 — Accessibility + motion pass (0.5–1 day)

### Goals
- Avoid shipping obvious accessibility issues.

### Tasks
- Keyboard:
  - Ensure all buttons/inputs have focus rings
  - Ensure list selection doesn’t trap focus
- Semantics:
  - Use proper headings (`h1`, `h2`)
  - Buttons are buttons (not clickable divs)
- Contrast:
  - Ensure muted text remains readable
- Reduced motion:
  - Motion minimal; respect `prefers-reduced-motion`

### Acceptance criteria
- Entire app usable via keyboard only.

---

## Phase 8 — Marketing pages + SEO (1–2 days)

### Goals
- Launch-ready public presence.

### Pages
- Landing (`/`)
- Pricing (`/pricing`)

### Tasks
- Landing page sections:
  - Hero: headline + subhead + CTA to Login
  - Demo block: sample email → generated response preview
  - Feature cards
  - Trust/privacy note
  - Footer
- Pricing page:
  - Free vs Pro plan cards
  - FAQ
- SEO metadata:
  - `title`, `description`
  - OpenGraph basics

### Acceptance criteria
- Looks good in both light/dark (or at least one mode if we decide to postpone dark).
- Metadata renders properly.

---

## Phase 9 — Production readiness UX smoke tests (0.5 day)

### Goals
- Ensure the polished UI doesn’t break flows.

### Smoke checklist
- Login → Dashboard → Generate → Copy
- History → Search → Save/Unsave → Regenerate
- Profile save works
- Upgrade CTA routes to billing

### Acceptance criteria
- No broken navigation.
- No fatal client errors seen during manual smoke.

---

## Suggested implementation order (recommended)

1) Phase 1 (shadcn) → 2 (primitives) → 3 (shell)
2) Phase 4 (dashboard) + Phase 5 (history)
3) Phase 6 (settings)
4) Phase 7 (a11y)
5) Phase 8 (marketing+SEO)
6) Phase 9 (smoke)

---

## Decisions to lock before coding

- **Theme mode:**
  - Option 1: Light-only for Sprint 5, add dark in Sprint 6
  - Option 2: Light + dark now (recommended if tokens already exist)
- **Toast system:**
  - shadcn `toast` vs `sonner` (sonner is common)
- **Nav style:**
  - Top nav only (fast) vs Side nav (more SaaS-like)

---

## Mapping to `docs/THEME_UI_UX.md`

- Primary CTA color: indigo/violet
- Card-based layout
- Quiet app pages; more gradient/glow only on marketing pages
- Quota transparency and upgrade UX

---

## Exit criteria (Sprint 5 complete)

- Marketing pages exist and look consistent with the app.
- App pages share a shell and use shadcn components.
- Accessibility baseline met.
- Manual smoke is clean.

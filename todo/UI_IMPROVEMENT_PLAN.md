# UI Improvement Plan — Personalized Email Reply Generator (PERG)

Date: 2026-03-17

Purpose: document the UI audit, concrete recommendations, prioritized implementation plan, file-level touchpoints, acceptance criteria, and next steps to make the app look and feel professionally designed.

---

## TL;DR
- Current UI is functional and consistent (Tailwind + shadcn primitives). It needs a focused polish pass to reach production-grade visual quality.
- Highest leverage improvements: mobile navigation + nav polish, dashboard reply editor UX, history list clarity, consistent typography/spacing, and better empty/loading states.
- Plan: 5 phased work items (Foundation → Dashboard → History → Settings → Public pages). Each phase includes files to edit and acceptance criteria.

---

## Quick inventory (what exists)
- Design tokens & theme: `src/app/globals.css`, `tailwind.config.ts` (good HSL token approach)
- App shell + layout primitives:
  - `src/components/app/AppShell.tsx`
  - `src/components/app/PageShell.tsx`
  - `src/components/app/PageHeader.tsx`
  - `src/components/app/EmptyState.tsx`, `LoadingState.tsx`, `InlineMessage.tsx`
- Core UI primitives (shadcn-like): `Button`, `Card`, `Input`, `Textarea`, `Tabs`, `Badge`, `Alert`, `ToggleGroup`, `Label` (under `src/components/ui/*`).
- Pages inspected (representative):
  - Public: `src/app/page.tsx`, `src/app/pricing/page.tsx`, `src/app/help/page.tsx`, `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`
  - Auth: `src/app/login/page.tsx`, `src/app/auth/callback/route.ts`
  - Authenticated: `src/app/(app)/dashboard/page.tsx`, `src/app/(app)/history/page.tsx`, `src/app/(app)/settings/profile/page.tsx`, `src/app/(app)/settings/billing/page.tsx`

---

## High-level findings
1. Visual foundation is solid, but app reads as "functional" rather than "polished product".
2. Mobile navigation is incomplete (no drawer), which hurts usability and perceived quality.
3. Actions and visual weight are inconsistent. Primary CTAs do not always stand out.
4. Dashboard reply UX is minimal (textarea + buttons). Needs an "editor" feel (preview, copy affordance, variation naming).
5. History list is dense and lacks clear scanning affordances (badges, saved icon, timestamp hierarchy).
6. Empty states are serviceable but can be more helpful and branded.
7. Legal/marketing pages lack typographic polish (use `prose` and better spacing).

---

## Cross-cutting UI recommendations
- Typography: create a simple scale and enforce it via utility classes or component wrappers (use `text-2xl`, `text-lg`, `text-sm` consistently and adjust line-height). Consider adding a `Prose` wrapper for content pages.
- Spacing: standardize vertical rhythm on PageShell (32px major sections), and use consistent card padding.
- Buttons: ensure primary actions use `variant="default"`/`primary` and secondary actions use `outline` or `ghost` with clear visual difference. Use icons for common actions (Copy, Save, Regenerate).
- Loading states: replace text-only loaders with skeletons for lists and editor areas.
- Iconography: use Lucide consistently and add small icons to buttons and badges.
- Accessibility: ensure focus outlines via `ring` tokens and confirm color contrast for badge backgrounds.

---

## Page-by-page audit & recommended changes (concise)

### AppShell / Navigation (`src/components/app/AppShell.tsx`)
- Issues: branding is plain text; mobile nav only shows header; active nav indicator is subtle.
- Changes:
  - Add small brand lockup (SVG mark + PERG text). Consider 24x24 icon.
  - Mobile nav sheet/drawer (use shadcn/ui `Sheet` or Radix `Dialog`) with same nav items.
  - Improve active state: left bar indicator + subtle bg on active item.
  - Add user menu (avatar/email, settings, sign out) in the header.
- Acceptance: mobile nav accessible, active nav visually distinct, user menu present.

### Dashboard (`src/app/(app)/dashboard/page.tsx`)
- Issues: reply area feels like a form element; variations labeled `V{n}`; actions equal weight.
- Changes:
  - Extract `ReplyEditor` component with Edit / Preview toggle, formatted read-only preview, and toolbar with Copy/Save/Regenerate triage.
  - Replace variations with `VariationsBar` showing labelled chips: Original, Variation 1, Variation 2, each with timestamp tooltip.
  - Make Generate primary (prominent) and Copy primary micro-action near editor.
- Acceptance: editor has preview + copy; variations readable; primary action visually prioritized.

### History (`src/app/(app)/history/page.tsx`)
- Issues: list items dense, inconsistent quick actions; toolbar clunky.
- Changes:
  - Create `GenerationListItem` component (badges, created time, tone/length chips, saved indicator icon).
  - Introduce `HistoryToolbar` component to contain search, filters, and saved/all toggles.
  - Ensure list selection state is highlighted with visible focus/hover styles.
- Acceptance: list scannability improved, toolbar consistent, save/regenerate actions discoverable.

### Profile (`src/app/(app)/settings/profile/page.tsx`)
- Issues: single long form; destructive area needs clarity.
- Changes:
  - Section the page: Account details, Preferences, Signature, Danger zone.
  - Add inline validation (e.g., email read-only if using magic link), and an emphasized destructive alert UI for Delete.
- Acceptance: form divided into sections; delete area uses alert card with icon.

### Billing (`src/app/(app)/settings/billing/page.tsx`) & Pricing
- Issues: cards functional but can look more premium.
- Changes:
  - Make plan cards more visual (feature icons, price label area, highlight Pro card with border and ribbon).
  - Ensure Manage subscription portal is discoverable and explain why/when it appears.
- Acceptance: Pro card highlighted; upgrade flow clear.

### Auth / Login (`src/app/login/page.tsx`) and callback
- Issues: auth card is minimal.
- Changes:
  - Add left value-prop column (optional) or small hero graphic.
  - Style Google button with icon and stronger affordance. Ensure link to Terms/Privacy.
- Acceptance: OAuth & magic-link flows visually clear; Google button matches brand patterns.

### Public pages (Home, Pricing, Help, Privacy, Terms)
- Issues: typographic and visual polish needed.
- Changes:
  - Use `prose` utility for legal pages.
  - Add hero background/illustration for Home; unify footer.
- Acceptance: consistent hero spacing; legal pages readable.

---

## Phased implementation plan (prioritized)

### Phase UI-1: Foundation polish (mobile nav + page header + toolbar) — 1–2 dev sessions
- Implement mobile nav drawer and user menu.
- Improve active nav styles.
- Create `Toolbar` component pattern for consistent top-of-page tools.
- Files: `src/components/app/AppShell.tsx`, `src/components/app/PageHeader.tsx`, new `src/components/app/Toolbar.tsx`.
- QA: run lint/tests/build, manually verify nav on mobile, and ensure no routing regressions.

### Phase UI-2: Dashboard editor-grade experience — 1–2 dev sessions
- Add `ReplyEditor` and `VariationsBar` components and integrate them.
- Make primary CTA visual hierarchy clear.
- Files: `src/app/(app)/dashboard/page.tsx`, `src/components/generation/ReplyEditor.tsx`, `src/components/generation/VariationsBar.tsx`.
- QA: unit smoke for editor rendering, manual copy/save/regenerate flows.

### Phase UI-3: History list/detail redesign — 1–2 dev sessions
- Create `GenerationListItem`, `HistoryToolbar` and clean list spacing.
- Files: `src/app/(app)/history/page.tsx`, `src/components/history/GenerationListItem.tsx`.
- QA: verify keyboard focus/selection, visual scanability.

### Phase UI-4: Settings polish (Profile + Billing) — 1 session
- Break profile into sections, strengthen destructive UI.
- Make billing plan cards more visual.
- Files: `src/app/(app)/settings/profile/page.tsx`, `src/app/(app)/settings/billing/page.tsx`.

### Phase UI-5: Public pages polish — 1 session
- Hero and FAQ improvements, `prose` for legal pages, shared `PublicFooter`.
- Files: `src/app/page.tsx`, `src/app/pricing/page.tsx`, `src/components/marketing/*`.

---

## File-level touchpoints (summary)
- App shell and layout: `src/components/app/AppShell.tsx`, `PageShell.tsx`, `PageHeader.tsx`
- Core new components: `src/components/app/Toolbar.tsx`, `src/components/generation/ReplyEditor.tsx`, `src/components/generation/VariationsBar.tsx`, `src/components/history/GenerationListItem.tsx`
- Pages: `src/app/(app)/dashboard/page.tsx`, `src/app/(app)/history/page.tsx`, `src/app/(app)/settings/profile/page.tsx`, `src/app/(app)/settings/billing/page.tsx`, `src/app/page.tsx`, `src/app/pricing/page.tsx`

---

## Acceptance criteria (how we judge "done")
- Visual: Header, shell, and nav on mobile + desktop match proposed patterns and feel coherent.
- Usability: Dashboard editor has explicit Copy/Save/Regenerate affordances and variations are readable.
- Consistency: buttons, badges, and forms follow a consistent visual hierarchy across pages.
- Quality gates: `npm run lint`, `npm test`, `npm run build` remain green after changes; Playwright smoke tests still pass.
- Accessibility: keyboard focus visible; major color contrasts pass common-sense checks.

---

## Risks & mitigations
- Risk: large visual changes cause CSS regressions. Mitigation: small iterative PRs, snapshot screenshots (manual) and run lint/build/tests after each PR.
- Risk: heavy UI work delays other launch items. Mitigation: phase work and ship smallest improvement that increases perceived quality first (nav + dashboard editor).

---

## Next steps (recommended immediate action)
1. Confirm priority: start with **Phase UI-1 (mobile nav + toolbar)** or **Phase UI-2 (dashboard editor)**. I recommended Phase UI-1 as highest leverage.
2. I will implement the chosen phase, create small focused commits, run lint/tests/build, and request your review.

---

Created-by: automated UI audit + implementation plan


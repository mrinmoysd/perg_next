# UI/UX + Theming Guide (Modern AI SaaS)

**Version:** 1.0 (2026-03-10)

This document defines an attractive, modern design system suitable for AI productivity tools. It’s compatible with TailwindCSS + shadcn/ui.

## 1) Goals
- Feel like a premium AI tool: clean, confident, minimal friction.
- Make the core action (Generate) visually obvious.
- Increase trust: privacy cues, predictable billing messaging.
- Stay accessible (WCAG AA).

## 2) Visual direction

### Brand personality
- Professional
- Fast
- Trustworthy
- Modern

### Design language
- Soft gradients in marketing pages, **flat/quiet** in app pages
- Card-based layout
- Subtle shadows and borders (avoid heavy skeuomorphism)

## 3) Color system

Recommended palette (Tailwind-friendly):

### Base
- Background (app): `slate-950` / `zinc-950` for dark mode; `slate-50` for light mode
- Surfaces (cards): `slate-900` in dark; `white` in light
- Borders: `slate-800` in dark; `slate-200` in light

### Primary (CTA)
- Primary: Indigo/Violet (very common in AI SaaS)
  - Light mode: `indigo-600` (hover `indigo-700`)
  - Dark mode: `indigo-500` (hover `indigo-400`)

### Accent (AI glow)
- Accent gradient for hero: `from-indigo-500 via-violet-500 to-fuchsia-500`

### Semantic
- Success: `emerald-500`
- Warning: `amber-500`
- Error: `rose-500`

Accessibility rule:
- Ensure text-on-primary contrast passes AA.

## 4) Typography

### Font pairing
- Headings: `Inter` or `Geist` (modern SaaS)
- Body: `Inter` (consistent)
- Code/mono (optional): `JetBrains Mono`

Type scale (suggested):
- H1: 44–56px (marketing)
- H2: 28–36px
- Body: 14–16px
- Small: 12–13px

## 5) Spacing, radius, shadows

- Radius: 12px for cards, 10px for inputs, 9999px for pills
- Shadows: subtle (e.g., `shadow-sm` in app, `shadow-lg` in marketing hero)

## 6) Components (shadcn/ui conventions)

### Buttons
- Primary: filled indigo
- Secondary: outline
- Tertiary: ghost

CTA priority:
- In dashboard, only **Generate** should be primary.

### Inputs
- Email textarea: large, comfortable line height, placeholder example
- Tone selector: dropdown with icons
- Length selector: segmented control

### Output editor
- Use a bordered card
- Provide sticky action bar: Copy, Save, Regenerate

### History
- Compact list with timestamps
- Hover actions: “Open”, “Save/Unsave”

### Pricing cards
- Highlight Pro as “Most Popular” with subtle glow border

## 7) Layout & navigation

### Marketing
- Top nav: Logo, Features, Pricing, Login, CTA button
- Hero: left copy + right demo card (sample email -> reply)
- Social proof: “Used by freelancers, founders…” (even if no logos yet)

### App
- Simple top bar with user menu
- Left rail history (collapsible)
- Main working area

## 8) UX patterns that convert (competitor-informed)

### 8.1 Reduce blank-state friction
- Default example email prefilled (editable)
- “Try Example” button

### 8.2 Time-to-value
- After login, automatically focus the email input
- Show tone/length defaults based on profile

### 8.3 Trust & privacy messaging
- Near input: “Your email content is used only to generate your reply.”
- Settings: “Delete my data” action

### 8.4 Variations UX
- After regenerate, allow switching between versions
- Provide “Compare” toggle (optional)

### 8.5 Quota transparency
- Badge: “Free: 3/10 replies left today”
- Upgrade CTA only when needed

## 9) Motion & microinteractions

- Loading: skeleton in output + subtle animated dots
- Copy: toast “Copied” with undo (optional)
- Save: icon toggle animation

Keep motion minimal and respect `prefers-reduced-motion`.

## 10) Screens (wireframe-level)

### 10.1 Dashboard
- Left: History
- Center: Email input + tone + length + generate
- Right/bottom: Output with actions

### 10.2 History detail
- Show the original email input collapsed/expandable
- Show metadata: tone, length, date

### 10.3 Pricing
- Plan cards + comparison
- FAQ

## 11) Tailwind/shadcn implementation notes

- Enable dark mode (`class` strategy)
- Use CSS variables for theme tokens
- Use shadcn/ui “new-york” style for clean look

Suggested UI tokens:
- `--radius: 12px`
- `--primary: 234 89% 62%` (approx indigo)

## 12) Copy tone

App UI copy should be:
- direct
- calm
- confidence-building

Examples:
- Error: “We couldn’t generate a reply right now. Try again in a few seconds.”
- Quota: “You’ve used today’s free replies. Upgrade to continue.”

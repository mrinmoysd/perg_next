# Production validation checklist (auth + billing + webhooks)

Use this checklist before every production release.

## 0) Required environment variables

Confirm these exist in the production environment (Vercel/Supabase/host):

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### App URL
- `NEXT_PUBLIC_APP_URL`
  - Example: `https://perg.app`

### Stripe
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`

### (Sprint A) Observability
- `SENTRY_DSN` (or the framework-specific DSN keys)

---

## 1) Auth (magic link + cookie session)

### Supabase settings
- In Supabase Auth settings:
  - Site URL is set to your production URL (matches `NEXT_PUBLIC_APP_URL`).
  - Redirect URLs include:
    - `${NEXT_PUBLIC_APP_URL}/login`
    - `${NEXT_PUBLIC_APP_URL}/auth/callback` (if used)

### App smoke
- Visit `/login`
- Request magic link
- Open link → confirm:
  - you land back on `/login` with a URL fragment
  - the client calls `POST /api/auth/set-session`
  - cookie `perg_access_token` is set
  - redirect goes to `/dashboard` (or `next` param)

### Protected routes
- Visit `/dashboard` while logged out → confirm redirect to `/login?next=/dashboard`.

---

## 2) Stripe checkout + webhook verification

### Stripe dashboard settings
- Checkout success/cancel URLs should point to your prod domain.

### Webhook endpoint
- Stripe webhook endpoint configured to:
  - `${NEXT_PUBLIC_APP_URL}/api/webhooks/stripe`
- Webhook events enabled (minimum):
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - (Sprint B) `invoice.payment_succeeded`
  - (Sprint B) `invoice.payment_failed`

### Smoke
- Start upgrade from `/settings/billing` → loads Stripe Checkout
- Complete payment in test mode (or prod with a real price)
- Confirm:
  - webhook receives event (200)
  - `subscriptions` row is created/updated
  - `users.plan` becomes `pro`
  - app quota changes accordingly

---

## 3) Health + basic diagnostics

- `GET /api/health` returns 200
- Generate flow works end-to-end:
  - `/dashboard` → Generate → Copy → Save
  - `/history` shows the item and search works

---

## 4) Rollback plan

- If auth is broken: revert to last known-good deployment and re-check Supabase redirect URLs.
- If billing is broken: pause marketing CTA and disable upgrade CTA temporarily.

---

## 5) Post-release (first 72 hours)

- Monitor Sentry for errors
- Spot-check Stripe webhooks and subscription state updates
- Check generation error rate and latency

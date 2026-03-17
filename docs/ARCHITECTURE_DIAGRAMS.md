# Architecture Diagrams (Mermaid)

These diagrams are derived from `MASTER_SPEC.md` + `ARCHITECTURE.md`.

## 1) Component diagram

```mermaid
flowchart LR
  U[User Browser] -->|HTTPS| NX[Next.js App (Vercel)]

  subgraph Vercel[Hosting: Vercel]
    NX --> API[Route Handlers /api/*]
    NX --> UI[App Router Pages]
    API --> LLM[LLM Adapter]
    API --> DB[DB Access Layer]
    API --> BILL[Billing Adapter]
    API --> Q[Quota Service]
    API --> AN[Analytics Emitter]
  end

  subgraph Supabase[Supabase]
    SBAuth[Auth] 
    PG[(Postgres)]
  end

  subgraph External[External Services]
    OpenAI[(OpenAI API)]
    Stripe[(Stripe)]
    PostHog[(PostHog/Plausible)]
    Sentry[(Sentry)]
  end

  NX <--> SBAuth
  DB <--> PG
  LLM --> OpenAI
  BILL <--> Stripe
  AN --> PostHog
  API --> Sentry
```

## 2) Sequence diagram — generate reply

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant UI as Browser UI
  participant API as Next.js API (/api/generate)
  participant Auth as Auth (Supabase/NextAuth)
  participant Q as QuotaService
  participant DB as Postgres (Supabase)
  participant LLM as OpenAI

  User->>UI: Paste email + select tone/length
  UI->>API: POST /api/generate
  API->>Auth: Validate session
  Auth-->>API: userId
  API->>Q: canGenerate(userId)
  Q-->>API: allowed/remaining
  alt quota exceeded
    API-->>UI: 429 QUOTA_EXCEEDED
  else allowed
    API->>DB: insert generations(status=created)
    DB-->>API: generationId
    API->>LLM: Create completion (prompt)
    LLM-->>API: reply + tokens
    API->>DB: update generations(status=succeeded, reply, prompt, tokens)
    API->>Q: incrementSuccess(userId)
    API-->>UI: 200 {reply, id, metadata}
  end
```

## 3) Sequence diagram — Stripe subscription

```mermaid
sequenceDiagram
  autonumber
  actor User
  participant UI as Browser UI
  participant API as Next.js API
  participant Stripe as Stripe
  participant Wh as Webhook (/api/webhooks/stripe)
  participant DB as Postgres

  User->>UI: Click Upgrade
  UI->>API: POST create-checkout-session
  API->>Stripe: Create Checkout Session
  Stripe-->>UI: Redirect URL
  User->>Stripe: Enter payment
  Stripe-->>Wh: webhook event
  Wh->>Stripe: Verify signature
  Wh->>DB: upsert subscriptions + update users.plan
  UI->>API: Refresh profile/plan
  API-->>UI: plan=pro
```

## 4) Deployment diagram

```mermaid
flowchart TB
  subgraph Client
    B[Browser]
  end

  subgraph Vercel
    FE[Next.js Frontend]
    SRV[Next.js Serverless APIs]
  end

  subgraph Supabase
    AUTH[Auth]
    PG[(Postgres)]
  end

  subgraph ThirdParty
    OAI[(OpenAI)]
    ST[(Stripe)]
    AN[(Analytics)]
    SE[(Sentry)]
  end

  B --> FE
  FE --> SRV
  SRV --> AUTH
  SRV --> PG
  SRV --> OAI
  SRV --> ST
  SRV --> SE
  FE --> AN
```

## 5) ER diagram (Mermaid)

> Source of truth is `ER_DIAGRAM.dbml`. This Mermaid view is for quick docs.

```mermaid
erDiagram
  USERS ||--o{ GENERATIONS : has
  GENERATIONS ||--o{ GENERATIONS : parent
  USERS ||--o| SUBSCRIPTIONS : has
  USERS ||--o{ USAGE_COUNTERS : has
  USERS ||--o{ AUDIT_EVENTS : has

  USERS {
    uuid id PK
    text email
    text name
    text job_title
    text company
    text signature
    text default_tone
    text plan
  }

  GENERATIONS {
    uuid id PK
    uuid user_id FK
    uuid parent_id FK
    text email_input
    text tone
    text length
    text ai_model
    text prompt
    text ai_reply
    int tokens_used
    int latency_ms
    text status
    boolean is_saved
  }

  SUBSCRIPTIONS {
    uuid id PK
    uuid user_id FK
    text plan
    text status
    text stripe_customer_id
    text stripe_subscription_id
    timestamptz current_period_end
  }

  USAGE_COUNTERS {
    uuid id PK
    uuid user_id FK
    date day
    int successful_generations
  }

  AUDIT_EVENTS {
    uuid id PK
    uuid user_id FK
    text event_type
    jsonb payload
  }
```

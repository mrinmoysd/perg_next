# Project docs index — Personalized Email Reply Generator

This index points to all handoff-ready artifacts in the repository and gives quick instructions for rendering diagrams and the OpenAPI spec.

Recommended reading order
1. `MASTER_SPEC.md` — consolidated product requirements and launch decisions (high-level).
2. `SPEC.md` / `PRD.md` — original spec + product requirements (reference).
3. `LLD.md` — low-level design for implementation (services, APIs, repos).
4. `ARCHITECTURE.md` — architecture overview and deployment decisions.
5. `SYSTEM_DESIGN.md` — system design, scaling and reliability considerations.
6. `ER_DIAGRAM.dbml` + `ER_DIAGRAM` (Mermaid in `ARCHITECTURE_DIAGRAMS.md`) — data model.
7. `DATA_DICTIONARY.md` — column-level definitions and examples.
8. `API_OPENAPI.yaml` — OpenAPI spec for core endpoints.
9. `ARCHITECTURE_DIAGRAMS.md` — mermaid diagrams: component, sequence and deployment.
10. `THEME_UI_UX.md` — theming and UX patterns for frontend implementation.

Files and short descriptions
- `PRD.md` — original product requirements.
- `SPEC.md` — expanded spec derived from PRD.
- `MASTER_SPEC.md` — final validated spec with market research and launch plan.
- `LLD.md` — low-level design: modules, route handlers, services, repo APIs.
- `ARCHITECTURE.md` — component and deployment architecture.
- `SYSTEM_DESIGN.md` — scaling, reliability, and cost controls.
- `ER_DIAGRAM.dbml` — DBML source for ER diagrams (use dbdiagram.io).
- `ER_DIAGRAM.dbml` is the canonical ER source of truth.
- `ARCHITECTURE_DIAGRAMS.md` — Mermaid diagrams (component, sequences, ER view).
- `DATA_DICTIONARY.md` — data dictionary for all tables/columns.
- `API_OPENAPI.yaml` — OpenAPI 3.1 spec (can be loaded into Swagger Editor / Redoc).
- `THEME_UI_UX.md` — UI system, color tokens, components, UX patterns.

Quick commands & tips

- Render DBML (dbdiagram.io):

```bash
# Open https://dbdiagram.io and paste the contents of ER_DIAGRAM.dbml
```

- Render Mermaid diagrams:

```bash
# GitHub renders mermaid in .md files. In VS Code, install 'Markdown Preview Mermaid Support' or use the built-in preview.
```

- Open the OpenAPI file:

```bash
# Use https://editor.swagger.io/ and paste or upload API_OPENAPI.yaml
# Or use Redoc: npx redoc-cli serve API_OPENAPI.yaml
```

Notes for implementers
- Use `ER_DIAGRAM.dbml` as the single source for DB migrations. You can generate migration SQL from the dbml or manually write Postgres migrations.
- `API_OPENAPI.yaml` should be kept in sync with `LLD.md` route docs; generate client SDKs if desired.
- Follow `THEME_UI_UX.md` tokens for consistent Tailwind/shadcn implementation.

Next recommended actions (pick one)
- Generate SQL migration files from `ER_DIAGRAM.dbml`.
- Scaffold API route handlers using `API_OPENAPI.yaml` and `LLD.md`.
- Create Playwright E2E test skeleton using `LLD.md` flows.

If you want any of those scaffolds created now, tell me which and I will implement it.

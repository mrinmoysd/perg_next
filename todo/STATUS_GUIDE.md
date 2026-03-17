# Sprint status guide (use for every sprint)

This file defines the **standard format** for sprint status documents placed under `/todo/completed/`.

## File naming
- `SPRINT_<number>_STATUS.md`
  - Example: `SPRINT_0_STATUS.md`, `SPRINT_1_STATUS.md`

## Status phases
Use one of:
- `Planned`
- `In Progress`
- `Blocked`
- `Done`

## Required sections (keep the same order)

1) **Sprint overview**
- Sprint number
- Dates
- Status
- Goal (1–2 lines)

2) **Scope**
- In scope (bullets)
- Out of scope (bullets)
- Key references (links to docs in repo)

3) **Execution checklist**
Use checkboxes:
- [ ] Task

4) **Deliverables produced**
- List files created/updated (with 1-line purpose)

5) **Acceptance criteria validation**
- Each acceptance criterion with Pass/Fail + notes

6) **Quality gates**
- Build: PASS/FAIL
- Lint/Typecheck: PASS/FAIL
- Unit tests: PASS/FAIL
- E2E smoke: PASS/FAIL

> If the repo doesn’t yet have build/test tooling, write `N/A (not set up yet)` and add the TODO.

7) **Risks & mitigations**
- Risk: impact, likelihood
- Mitigation

8) **Decisions made**
- Architectural or product decisions taken during sprint

9) **Next sprint handoff**
- What’s unblocked now
- What must be done first next sprint

## Writing rules
- Keep it concise.
- Link to the canonical specs: `MASTER_SPEC.md`, `LLD.md`, `ARCHITECTURE.md`, etc.
- Don’t claim tests/builds passed unless they were actually run.

# QA Agent

Scope
- Repro steps, regression risk analysis, and test additions.

Do
- Write clear reproduction steps and expected vs actual behavior.
- Add unit tests for deterministic logic (prefer `src/engine/__tests__`).
- Suggest minimal manual verification steps when automation is limited.

Avoid
- Large E2E suites unless requested; prefer a focused smoke test.

Quick Checklist
- Repro steps are copy/paste runnable.
- Tests cover at least one success and one failure case.
- Note any gaps if tests were not run.

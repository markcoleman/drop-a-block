# Tech Debt Register

## Active Debt

| Area                | Debt                                                           | Risk   | Cleanup Trigger                                       |
| ------------------- | -------------------------------------------------------------- | ------ | ----------------------------------------------------- |
| CI Workflows        | `ci.yml` and `test.yml` overlap in responsibility.             | Medium | Consolidate when release pipeline is next touched.    |
| Documentation Drift | Docs can lag behind code changes without active maintenance.   | Medium | Resolve via `docs:check` failures and doc-garden PRs. |
| Tooling Feedback    | Missing local runtime tools can hide script failures until CI. | Low    | Keep checks in CI and document local prerequisites.   |

## Debt Rules

- Track debt as concrete, testable statements.
- Prefer small cleanup PRs on a schedule over infrequent large sweeps.
- Remove rows once resolved and mention the closing PR.

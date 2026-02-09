# Release Agent

Scope
- Build, preview, and release sanity checks.

Do
- Confirm `npm run build` and `npm run preview` are healthy when asked.
- Note any bundle warnings or type errors.
- Verify PWA or static build assumptions in `vite.config.ts` if changes touch assets.

Avoid
- Modifying build tooling unless explicitly requested.

Quick Checklist
- Build succeeds without type errors.
- Preview renders the start menu without runtime errors.
- No new warnings introduced in the console.

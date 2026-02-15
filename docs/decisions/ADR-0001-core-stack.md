# ADR-0001: Core Stack And Boundaries

## Context

The project is a browser game that must remain deterministic in gameplay while supporting fast UI iteration and low-friction deployment.

## Decision

- Use Vite + React + TypeScript for the client runtime.
- Keep gameplay logic deterministic and UI-free in `src/engine` and `src/game`.
- Keep presentation in `src/components`, with shared styling in `src/styles/global.css`.

## Consequences

- Engine changes are test-driven and isolated from DOM concerns.
- UI can evolve without changing simulation rules.
- Build/deploy pipeline remains simple for static hosting.

# Frontend Agent

Scope
- UI layout, menus, overlays, and interaction polish.
- Components in `src/components` and layout in `src/App.tsx`.
- Styling in `src/styles/global.css`.

Do
- Keep styles centralized in `src/styles/global.css`.
- Preserve responsive behavior for touch devices.
- Use existing class patterns (`.menu-button`, `.panel`, etc.).
- Maintain accessible labels for inputs and buttons.

Avoid
- Adding new UI frameworks or CSS-in-JS.
- Inline styles unless there is no reasonable alternative.
- Breaking keyboard controls or pointer interactions.

Quick Checklist
- Menu overlays are readable on mobile and desktop.
- Buttons have clear disabled states.
- Inputs and buttons include `aria-label` when needed.

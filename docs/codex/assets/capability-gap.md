# Capability Gap Template

Use this when a task fails repeatedly and retrying prompts is not productive.

## Missing Capability

- What specific capability is missing from this environment?
- What concrete failure does it cause?

## Visibility Upgrade

- What file, doc, config, or script should be added so the capability is visible in-repo?
- Where should it live?

## Enforceability Upgrade

- What check should fail when this requirement is broken? (`npm` script, CI step, test, lint rule, etc.)
- What automation should keep it healthy over time?

## Minimal Next Action

- Smallest PR that removes this gap.

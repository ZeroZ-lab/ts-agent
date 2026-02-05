---
name: agents-md-updater
description: Append concise change summaries to AGENTS.md when features, behavior, or configuration are added or modified in this repo. Use when implementing new functionality or altering existing behavior that should be recorded for collaborators.
---

# AGENTS.md Updater

## Quick start

1. Draft a one-line summary of the change.
2. Run `scripts/append_agents_md.py "<summary>"`.
3. Confirm the new entry appears under the auto-append section.

## Workflow

1. Identify what changed (feature, behavior, config, API).
2. Condense the change into a single sentence.
3. Add an entry to AGENTS.md using the script.
4. If the change spans multiple areas, include key file paths in the summary.

## Output format

See `references/summary_format.md` for the exact line format and examples.

## Script

`scripts/append_agents_md.py`:

- Locate the nearest `AGENTS.md` by walking up from the current directory.
- Ensure the `## 变更摘要（自动追加）` section exists.
- Append a dated summary entry under that section.

## Guardrails

- Do not include secrets or API keys.
- Keep summaries to one line.
- Use the repository’s primary language (中文).


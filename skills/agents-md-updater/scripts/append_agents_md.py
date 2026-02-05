from __future__ import annotations

import datetime
import sys
from pathlib import Path


SECTION_TITLE = "## 变更摘要（自动追加）"


def find_agents_md(start: Path) -> Path | None:
    current = start.resolve()
    for parent in [current, *current.parents]:
        candidate = parent / "AGENTS.md"
        if candidate.exists():
            return candidate
    return None


def read_summary(argv: list[str]) -> str:
    text = " ".join(argv).strip()
    if text:
        return text
    if not sys.stdin.isatty():
        text = sys.stdin.read().strip()
    return text


def main() -> int:
    summary = read_summary(sys.argv[1:]).replace("\n", " ").strip()
    if not summary:
        sys.stderr.write("Usage: append_agents_md.py \"<summary>\"\\n")
        return 2

    agents_path = find_agents_md(Path.cwd())
    if agents_path is None:
        sys.stderr.write("AGENTS.md not found in current or parent directories.\\n")
        return 1

    content = agents_path.read_text(encoding="utf-8")
    if SECTION_TITLE not in content:
        if content and not content.endswith("\n"):
            content += "\n"
        content += f"\n{SECTION_TITLE}\n"

    today = datetime.date.today().isoformat()
    entry = f"- {today}：{summary}\n"
    content += entry
    agents_path.write_text(content, encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


from __future__ import annotations

import datetime
import sys
from pathlib import Path


SECTION_TITLE = "## 变更摘要（自动追加）"
ERRORS_REL_PATH = Path("AGENTS") / "ERRORS.md"


def usage() -> str:
    return (
        "Usage:\n"
        "  append_agents_md.py \"<summary>\"\n"
        "  append_agents_md.py --kind change \"<summary>\"\n"
        "  append_agents_md.py --kind error \"<summary>\"\n"
    )


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


def parse_args(argv: list[str]) -> tuple[str, list[str]]:
    kind = "change"
    rest: list[str] = []

    i = 0
    while i < len(argv):
        a = argv[i]
        if a in ("-h", "--help"):
            sys.stdout.write(usage())
            raise SystemExit(0)
        if a == "--kind":
            if i + 1 >= len(argv):
                sys.stderr.write("ERROR: --kind requires a value (change|error)\n")
                sys.stderr.write(usage())
                raise SystemExit(2)
            kind = argv[i + 1]
            i += 2
            continue
        if a.startswith("--kind="):
            kind = a.split("=", 1)[1]
            i += 1
            continue
        rest.append(a)
        i += 1

    if kind not in ("change", "error"):
        sys.stderr.write(f"ERROR: invalid --kind: {kind} (expected change|error)\n")
        sys.stderr.write(usage())
        raise SystemExit(2)

    return kind, rest


def split_lines_keepends(text: str) -> list[str]:
    if not text:
        return []
    return text.splitlines(keepends=True)


def ensure_trailing_newline(text: str) -> str:
    return text if not text or text.endswith("\n") else text + "\n"


def append_under_section(markdown: str, section_title: str, entry_line: str) -> str:
    md = ensure_trailing_newline(markdown)
    lines = split_lines_keepends(md)

    def is_heading(line: str) -> bool:
        return line.startswith("## ")

    title_idx = -1
    for idx, line in enumerate(lines):
        if line.rstrip("\n") == section_title:
            title_idx = idx
            break

    if title_idx == -1:
        if lines and lines[-1].strip() != "":
            lines.append("\n")
        lines.append(section_title + "\n")
        lines.append("\n")
        lines.append(entry_line)
        return "".join(lines)

    insert_at = len(lines)
    for idx in range(title_idx + 1, len(lines)):
        if is_heading(lines[idx]) and lines[idx].rstrip("\n") != section_title:
            insert_at = idx
            break

    after_title = title_idx + 1
    if after_title >= len(lines) or lines[after_title].strip() != "":
        lines.insert(after_title, "\n")
        insert_at += 1 if insert_at >= after_title else 0

    if insert_at > 0 and lines[insert_at - 1].strip() != "":
        lines.insert(insert_at, "\n")
        insert_at += 1

    lines.insert(insert_at, entry_line)
    return "".join(lines)


def ensure_errors_file(errors_path: Path) -> None:
    if errors_path.exists():
        return
    errors_path.parent.mkdir(parents=True, exist_ok=True)
    errors_path.write_text(
        "# 常见错误记录（自动追加）\n\n"
        "格式：\n\n"
        "```\n"
        "- YYYY-MM-DD：现象 / 原因 / 修复（可带关键文件或 env key）\n"
        "```\n\n",
        encoding="utf-8",
    )


def main() -> int:
    kind, rest = parse_args(sys.argv[1:])
    summary = read_summary(rest).replace("\n", " ").strip()
    if not summary:
        sys.stderr.write(usage())
        return 2

    agents_path = find_agents_md(Path.cwd())
    if agents_path is None:
        sys.stderr.write("AGENTS.md not found in current or parent directories.\\n")
        return 1

    today = datetime.date.today().isoformat()
    entry = f"- {today}：{summary}\n"

    if kind == "change":
        content = agents_path.read_text(encoding="utf-8")
        updated = append_under_section(content, SECTION_TITLE, entry)
        agents_path.write_text(updated, encoding="utf-8")
        return 0

    errors_path = agents_path.parent / ERRORS_REL_PATH
    ensure_errors_file(errors_path)
    existing = ensure_trailing_newline(errors_path.read_text(encoding="utf-8"))
    errors_path.write_text(existing + entry, encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

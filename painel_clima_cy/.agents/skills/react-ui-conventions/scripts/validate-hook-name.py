#!/usr/bin/env python3
"""Validate a React hook identifier against the convention in assets/hook-name.regex."""

import argparse
import re
import sys
from pathlib import Path

_SKILL_ROOT = Path(__file__).resolve().parent.parent
_PATTERN_FILE = _SKILL_ROOT / "assets" / "hook-name.regex"


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Check that a hook name starts with 'use' and uses camelCase (e.g. useAuth, useLocalStorage)."
    )
    parser.add_argument("name", help="Hook function name to validate.")
    args = parser.parse_args()

    try:
        pattern_text = _PATTERN_FILE.read_text(encoding="utf-8").strip()
    except OSError as exc:
        print(f"ERROR: Cannot read pattern file {_PATTERN_FILE}: {exc}", file=sys.stderr)
        sys.exit(2)

    if not pattern_text:
        print("ERROR: Pattern file is empty.", file=sys.stderr)
        sys.exit(2)

    pattern = re.compile(pattern_text)
    name = args.name.strip()

    if pattern.fullmatch(name):
        print(f"OK: '{name}' matches the hook naming convention.")
        sys.exit(0)

    print(
        f"ERROR: '{name}' does not match hook naming convention (expected pattern in assets/hook-name.regex).",
        file=sys.stderr,
    )
    sys.exit(1)


if __name__ == "__main__":
    main()

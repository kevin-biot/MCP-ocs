#!/usr/bin/env python3
"""
LOC Reporter: Summarize lines of code by file type.

Usage:
  python3 scripts/loc_report.py [ROOT]

Counts total lines per file type (by extension or shebang) while skipping
non-code directories and git-related files. Outputs a sorted summary.
"""

from __future__ import annotations

import argparse
import os
import sys
from collections import defaultdict
from typing import Dict, Iterable, Optional, Set, Tuple


# Directories to skip entirely
DEFAULT_EXCLUDE_DIRS: Set[str] = {
    ".git",
    "node_modules",
    "dist",
    "build",
    "target",
    ".venv",
    "venv",
    "__pycache__",
    ".mypy_cache",
    ".pytest_cache",
    ".next",
    ".cache",
    "coverage",
    "artifacts",
    "logs",
}


# Files to skip by exact basename
EXCLUDE_BASENAMES: Set[str] = {
    ".gitignore",
    ".gitattributes",
    ".gitmodules",
}


# Whitelist of code/script extensions (lowercase, without the leading dot)
CODE_EXTENSIONS: Set[str] = {
    # Core scripting / programming
    "py", "pyw",
    "js", "mjs", "cjs", "jsx",
    "ts", "tsx",
    "sh", "bash", "zsh", "fish",
    "ps1", "bat", "cmd",
    "rb", "php", "pl", "pm",
    "go", "rs",
    "java", "kt", "kts", "scala",
    "swift",
    "c", "h", "cc", "cpp", "cxx", "hh", "hpp",
    "m", "mm",  # Objective-C / Obj-C++
    "cs",
    "r", "jl", "lua",
    "sql",
    "groovy", "gradle",
}


# Special filenames treated as code even without extension
SPECIAL_CODE_FILENAMES = {
    "Makefile": "make",
    "GNUmakefile": "make",
    "Dockerfile": "dockerfile",
}


# Shebang hint mapping -> file type key
SHEBANG_MAP = {
    "python": "py",
    "python3": "py",
    "python2": "py",
    "bash": "sh",
    "sh": "sh",
    "zsh": "sh",
    "fish": "fish",
    "node": "js",
    "deno": "ts",
    "ruby": "rb",
    "perl": "pl",
    "php": "php",
}


def detect_shebang_type(first_line: str) -> Optional[str]:
    if not first_line.startswith("#!"):
        return None
    lower = first_line.strip().lower()
    for key, ftype in SHEBANG_MAP.items():
        if f"/{key}" in lower or lower.endswith(key):
            return ftype
    # env-style shebangs: #!/usr/bin/env python3
    parts = lower.split()
    if len(parts) >= 2 and parts[0].startswith("#!"):
        env_target = parts[1].split("/")[-1]
        return SHEBANG_MAP.get(env_target)
    return None


def should_include_file(path: str, st_mode: int, first_line: str) -> Tuple[bool, Optional[str]]:
    base = os.path.basename(path)
    if base in EXCLUDE_BASENAMES:
        return False, None

    if base in SPECIAL_CODE_FILENAMES:
        return True, SPECIAL_CODE_FILENAMES[base]

    _, ext = os.path.splitext(base)
    if ext:
        extkey = ext[1:].lower()
        if extkey in CODE_EXTENSIONS:
            return True, extkey

    # Executable with a shebang but no/unknown extension
    if (st_mode & 0o111) != 0:  # any execute bit set
        ftype = detect_shebang_type(first_line)
        if ftype is not None:
            return True, ftype

    return False, None


def iter_files(root: str) -> Iterable[str]:
    for dirpath, dirnames, filenames in os.walk(root):
        # Prune excluded directories in-place for performance
        dirnames[:] = [d for d in dirnames if d not in DEFAULT_EXCLUDE_DIRS]
        for fname in filenames:
            yield os.path.join(dirpath, fname)


def count_lines(path: str, non_empty: bool) -> int:
    lines = 0
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        if non_empty:
            for line in f:
                if line.strip():
                    lines += 1
        else:
            for _ in f:
                lines += 1
    return lines


def main(argv: Optional[Iterable[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Report lines of code by file type")
    parser.add_argument("root", nargs="?", default=".", help="Root directory to scan (default: .)")
    parser.add_argument("--non-empty", action="store_true", help="Count only non-empty lines")
    args = parser.parse_args(list(argv) if argv is not None else None)

    root = os.path.abspath(args.root)
    if not os.path.isdir(root):
        print(f"Error: {root} is not a directory", file=sys.stderr)
        return 2

    totals_by_type: Dict[str, int] = defaultdict(int)
    files_by_type: Dict[str, int] = defaultdict(int)
    total_lines = 0
    total_files = 0

    for path in iter_files(root):
        try:
            st = os.stat(path)
            # Read first line for shebang detection efficiently
            first_line = ""
            try:
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    first_line = f.readline()
            except Exception:
                first_line = ""

            include, ftype = should_include_file(path, st.st_mode, first_line)
            if not include or ftype is None:
                continue

            n = count_lines(path, non_empty=args.non_empty)
            totals_by_type[ftype] += n
            files_by_type[ftype] += 1
            total_lines += n
            total_files += 1
        except (OSError, UnicodeError):
            # Ignore unreadable files
            continue

    # Print results
    relroot = os.path.relpath(root, start=os.getcwd()) if root != os.getcwd() else "."
    header = f"Lines of code by file type in {relroot}"
    print(header)
    print("-" * len(header))

    if not totals_by_type:
        print("No code files found with current filters.")
        return 0

    # Sort by total lines desc, then by file type key
    items = sorted(totals_by_type.items(), key=lambda kv: (-kv[1], kv[0]))
    for ftype, nlines in items:
        nfiles = files_by_type.get(ftype, 0)
        print(f"{ftype:10s}  {nlines:10d} lines   ({nfiles:5d} files)")

    print()
    print(f"TOTAL         {total_lines:10d} lines   ({total_files:5d} files)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


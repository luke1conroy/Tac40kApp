#!/usr/bin/env python3
"""Fail closed on known publication mistakes; not a substitute for legal or secret review."""
from pathlib import Path
import re
import sys

root = Path(__file__).resolve().parents[1]
errors = []

# The Git directory is an expected part of every checkout, not a shipped source file.
for forbidden in ("data/catalogue", "infra/azure", ".github/workflows/cd.yml"):
    if (root / forbidden).exists():
        errors.append(f"Forbidden original-project path: {forbidden}")

# CI installs and compiles dependencies before running this script. Scan only the
# source tree, not the generated binaries, dependency caches or Git metadata.
ignored_dirs = {
    ".git", "node_modules", "dist", "bin", "obj", ".vite",
    "TestResults", "coverage", ".vs",
}
binary_extensions = {
    ".png", ".jpg", ".jpeg", ".ico", ".zip", ".dll", ".pdb",
    ".so", ".dylib", ".exe", ".webp", ".woff", ".woff2", ".svg",
}

for path in root.rglob("*"):
    if not path.is_file():
        continue
    relative = path.relative_to(root)
    if any(part in ignored_dirs for part in relative.parts):
        continue
    if path.suffix.lower() in binary_extensions:
        continue
    try:
        content = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        errors.append(f"Non-text file needs manual publication review: {relative}")
        continue

    if path.name not in {"README.md", "PUBLISHING.md", "NOTICE.md", "check_publication.py"} and re.search(
        r"(?i)games workshop|warhammer|wahapedia|bsdata|space wolves|space marines", content
    ):
        errors.append(f"Third-party game reference needs review: {relative}")
    if re.search(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----", content):
        errors.append(f"Private key detected: {relative}")
    if re.search(r"gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,}", content):
        errors.append(f"Possible GitHub token: {relative}")

if errors:
    print("Publication review failed:")
    for error in errors:
        print(" -", error)
    sys.exit(1)
print("Basic publication boundary checks passed; manual review still required.")

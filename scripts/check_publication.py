#!/usr/bin/env python3
"""Fail closed on a small list of known mistakes; not a substitute for legal review or secret scanning."""
from pathlib import Path
import re
import sys

root = Path(__file__).resolve().parents[1]
errors = []
for forbidden in (".git", "data/catalogue", "infra/azure", ".github/workflows/cd.yml"):
    if (root / forbidden).exists():
        errors.append(f"Forbidden original-project path: {forbidden}")

# Game names and proprietary asset words are intentionally absent from this release source.
for path in root.rglob("*"):
    if not path.is_file() or ".git" in path.parts or path.suffix.lower() in {".png", ".jpg", ".jpeg", ".ico", ".zip"}:
        continue
    text = path.read_text(encoding="utf-8")
    if path.name not in {"README.md", "PUBLISHING.md", "NOTICE.md", "check_publication.py"} and re.search(r"(?i)games workshop|warhammer|wahapedia|bsdata|space wolves|space marines", text):
        errors.append(f"Third-party game reference needs review: {path.relative_to(root)}")
    if re.search(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----", text):
        errors.append(f"Private key detected: {path.relative_to(root)}")
    if re.search(r"gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,}", text):
        errors.append(f"Possible GitHub token: {path.relative_to(root)}")

if errors:
    print("Publication review failed:")
    for error in errors:
        print(" -", error)
    sys.exit(1)
print("Basic publication boundary checks passed; manual and historical review still required.")

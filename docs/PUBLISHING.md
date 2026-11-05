# Publishing this independent public edition

**Do not change the visibility of the existing private `40k-combo-lab` repository.** That repository has game-catalogue and text-rights review blockers, historic commits, and deployment workflows. A visibility switch exposes the complete current repository and history, including files later deleted in newer commits.

The independent public edition has **already been published** at [luke1conroy/Tac40kApp](https://github.com/luke1conroy/Tac40kApp). The earlier clean-room initial-push procedure is complete; **do not run `git init` or attempt to push as if this repository were empty.**

For ongoing source changes and container releases:

1. Review source, licences, example data and generated assets before proposing a public commit.
2. Run `dotnet test tests/CombatProbabilityLab.Tests`, `cd web && npm install && npm run build && npm run test`, and `python3 scripts/check_publication.py`.
3. When touching containers, run `docker compose up --build -d`, `python3 scripts/smoke_containers.py`, then `docker compose down`.
4. Scan for secrets and third-party content, including historical revisions. The publication script is only an additional safeguard.
5. Propose changes via a pull request. The CI workflow checks the application and builds containers on pull requests; successful `main` builds publish images to GHCR as described in [CONTAINERS.md](CONTAINERS.md).
6. For public hosting beyond GitHub's container registry, configure HTTPS, an appropriate API/reverse-proxy origin, rate limiting and deployment secrets. Never reuse private project credentials.
7. Enable GitHub secret scanning and dependency/security alerts where available, and consider branch protection before accepting outside contributions.

## What this package intentionally does not contain

- Original game's datasets, unit/weapon rosters, names, official ability descriptions, or external scraper code.
- Any Git commit history, private issues, credentials, Azure subscriptions or production deployment targets from the original repository.
- The full original calculation engine or all original UI screens. This is a **smaller, runnable demonstration** of the statistical concept and architecture, not a feature-identical export.

## Rights and maintenance notes

This package was assembled to avoid the unresolved third-party rights issues found in the original project; it is not legal clearance of any future content that contributors might add. The new repository's MIT licence covers its original code, not any third-party game intellectual property.

If the owner later decides to add game-specific data, re-run an independent data provenance and licence review first.

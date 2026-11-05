# Publishing this independent public edition

**Do not change the visibility of the existing private `40k-combo-lab` repository.** That repository has game-catalogue and text-rights review blockers, historic commits, and deployment workflows. A visibility switch exposes the complete current repository and history, including files later deleted in newer commits.

Instead publish this clean package as a **new repository with fresh history**, such as the existing public [`luke1conroy/Tac40kApp`](https://github.com/luke1conroy/Tac40kApp):

1. Review every file here, especially LICENSE, NOTICE, source code, examples, and generated assets.
2. Run `python3 scripts/check_publication.py` plus `dotnet test tests/CombatProbabilityLab.Tests` and `cd web && npm install && npm run build` on a machine with those tools installed. Inspect all outputs and resolve failures.
3. Verify there is no inherited `.git` folder and no hidden history or stored credentials. Run a proper secret scan (for example `gitleaks`) over the package and later the new repository's complete history.
4. Use the **already-created empty public repository** [`luke1conroy/Tac40kApp`](https://github.com/luke1conroy/Tac40kApp), which was checked as empty on 5 November 2026. Verify it remains empty before pushing.
5. From the clean package root, run:

   ```bash
   git init -b main
   git add .
   git commit -m "Initial public generic combat probability lab"
   git remote add origin https://github.com/luke1conroy/Tac40kApp.git
   git push -u origin main
   ```

6. Enable GitHub secret scanning and dependency/security alerts where available. Consider branch protection if inviting contributors.
7. For a public website, deploy your own API with rate limiting and production CORS origins; set frontend `VITE_API_BASE_URL` to its actual HTTPS URL and configure the API `CORS_ALLOWED_ORIGINS` environment variable as a comma-separated list of allowed frontend origins. Do not reuse the private project's production Azure credentials or infrastructure.
8. Set repository description/topics and mark the project as **best effort / not actively maintained** if that remains true. Avoid promising a maintained game-data catalogue.

## What this package intentionally does not contain

- Original game's datasets, unit/weapon rosters, names, official ability descriptions, or external scraper code.
- Any Git commit history, private issues, credentials, Azure subscriptions or production deployment targets from the original repository.
- The full original calculation engine or all original UI screens. This is a **smaller, runnable demonstration** of the statistical concept and architecture, not a feature-identical export.

## Rights and maintenance notes

This package was assembled to avoid the unresolved third-party rights issues found in the original project; it is not legal clearance of any future content that contributors might add. The new repository's MIT licence covers its original code, not any third-party game intellectual property.

If the owner later decides to add game-specific data, re-run an independent data provenance and licence review first.

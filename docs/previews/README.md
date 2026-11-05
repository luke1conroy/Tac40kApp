# Authentic application screenshots

The PNGs in [`docs/screenshots/`](../screenshots/) are browser screenshots from the **real running React/Vite frontend**, not illustrations. The screenshot workflow starts the **real .NET API**, waits for the health endpoint, visits the UI with Playwright Chromium, runs the built-in fictional Balanced clash scenario, and captures full-page desktop and mobile views.

Captured views: `scenario-builder.png` (desktop form), `analysis-results.png` (desktop calculated results), `mobile-scenario.png` (390px form), `mobile-results.png` (390px results).

Reproduce: see [`web/scripts/capture-previews.mjs`](../../web/scripts/capture-previews.mjs) and [screenshot capture workflow](../../.github/workflows/capture-screenshots.yml). Run the API on port 5080 and Vite on port 5173, then execute `cd web && node scripts/capture-previews.mjs`.

Older SVG images here (`scenario-builder.svg`, `analysis-results.svg`, `mobile-layout.svg`) are **illustrative designs, not running-app screenshots**, and are retained only as historical references.

Only fictional sample data is used. Do not upload proprietary game data, third-party images, credentials or private project material.

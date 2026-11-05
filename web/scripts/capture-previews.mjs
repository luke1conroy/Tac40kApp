import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.resolve(scriptDir, '../../docs/screenshots');
const baseUrl = process.env.APP_URL ?? 'http://127.0.0.1:5173';

await mkdir(screenshotsDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /Build a scenario/i }).waitFor();
  await page.screenshot({
    path: path.join(screenshotsDir, 'scenario-builder.png'),
    fullPage: true,
    animations: 'disabled',
  });

  const analysisResponse = page.waitForResponse((response) =>
    response.url().includes('/api/analyse') && response.status() === 200);
  await page.getByRole('button', { name: /ANALYSE SCENARIO/i }).click();
  await analysisResponse;
  await page.getByRole('heading', { name: 'Outcome breakdown' }).waitFor();
  await page.screenshot({
    path: path.join(screenshotsDir, 'analysis-results.png'),
    fullPage: true,
    animations: 'disabled',
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: path.join(screenshotsDir, 'mobile-results.png'),
    fullPage: true,
    animations: 'disabled',
  });

  await page.getByRole('button', { name: 'Against a swarm' }).click();
  await page.screenshot({
    path: path.join(screenshotsDir, 'mobile-scenario.png'),
    fullPage: true,
    animations: 'disabled',
  });
  console.log('Captured four running-app screenshots in docs/screenshots/');
} finally {
  await browser.close();
}

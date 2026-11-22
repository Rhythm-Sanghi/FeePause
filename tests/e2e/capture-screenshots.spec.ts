import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Capture Visual Screenshots', () => {
  const screenshotsDir = path.resolve(process.cwd(), 'docs', 'screenshots');

  test.beforeAll(() => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  test('Capture Desktop (1440x900) - Core Judge Flow and Inspector', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // 1. Initial State
    await page.screenshot({ path: path.join(screenshotsDir, '01-desktop-initial.png'), fullPage: false });

    // 2. Load Sample 1 (Urgent Notice)
    await page.locator('#btn-sample-urgent-suspicious').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(screenshotsDir, '02-desktop-sample-inspected.png'), fullPage: false });

    // 3. Open Synthetic Portal for Urgent Notice (No Matching Charge)
    await page.locator('#btn-open-mock-portal').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(screenshotsDir, '04-desktop-synthetic-portal-no-match.png'), fullPage: false });
    await page.locator('.btn-close-modal').click();

    // 4. Load Sample 2 (Routine Reminder) and open Synthetic Portal (Matching Charge)
    await page.locator('#btn-sample-ordinary-reminder').click();
    await page.waitForTimeout(300);
    await page.locator('#btn-open-mock-portal').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(screenshotsDir, '03-desktop-synthetic-portal-match.png'), fullPage: false });
    await page.locator('.btn-close-modal').click();
  });

  test('Capture Mobile (390px) - Stacked Layout and Accessibility', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Load sample 1
    await page.locator('#btn-sample-urgent-suspicious').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(screenshotsDir, '05-mobile-sample-stacked.png'), fullPage: false });

    // Open Synthetic Portal on mobile
    await page.locator('#btn-open-mock-portal').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(screenshotsDir, '06-mobile-synthetic-portal.png'), fullPage: false });
    await page.locator('.btn-close-modal').click();
  });
});

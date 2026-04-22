import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. We wrap everything in a test.describe block
test.describe('Evaluation Demo Flow', () => {

  // 2. The beforeAll hook is now safely scoped inside the describe block
  test.beforeAll(() => {
    // Wipe and seed deterministic Harvester & Tractor
    const scriptPath = path.resolve(__dirname, '../../api-gateway/insert_chandigarh.js');
    execSync(`node "${scriptPath}"`);
  });

  // 3. Your main test loop follows
  test('Evaluation Flow - Logistics Loop', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER >>', msg.text()));
    page.on('pageerror', error => console.log('ERROR >>', error));

    // --- Step 1 (The Farmer Problem) ---
    await page.goto('http://localhost:3000/');

    // Click Farmer App View if not default
    await page.click('button:has-text("Farmer App View")');

    // Submit Farmer Request flow
    await page.fill('input[placeholder="+91 99999 99999"]', '9999999999');
    await page.click('button:has-text("Send OTP")');
    await page.fill('input[placeholder="• • • • • •"]', '123456');
    await page.click('button:has-text("Secure Login")');

    // Assert equipment page loads
    await expect(page.locator('h2:has-text("Request Equipment")')).toBeVisible();

    // Select equipment
    await page.selectOption('select', 'Harvester');

    // Click map to drop pin
    await page.waitForSelector('.leaflet-container');
    await page.locator('.leaflet-container').click({ position: { x: 200, y: 200 } });

    // Explicitly intercept API call to assert 201 response
    const submitPromise = page.waitForResponse(response =>
      response.url().includes('/api/requests') && response.request().method() === 'POST'
    );

    await page.click('button:has-text("Submit Request")');

    const submitRes = await submitPromise;
    expect(submitRes.status()).toBe(201);
    await expect(page.getByText(/Request confirmed/i)).toBeVisible({ timeout: 10000 });

    // --- Step 2 (The Inefficient Past) ---
    // First we must logout of farmer app
    await page.click('button:has-text("Logout")');
    
    // Now from landing, select Admin App and login
    await page.click('button:has-text("Admin Dashboard View")');
    await page.fill('input[placeholder="admin"]', 'admin');
    await page.fill('input[placeholder="••••••••"]', 'admin123');
    await page.click('button:has-text("Secure Login")');

    await expect(page.locator('text=AgriConnect Admin')).toBeVisible();

    await page.locator('button:has-text("Requests")').click({ force: true });
    
    // Check auto-allocated state
    const demoRequestRow = page.locator('tr').filter({ hasText: '9999999999' }).first();
    await expect(demoRequestRow).toBeVisible();
    await expect(demoRequestRow.locator('span:has-text("Allocated")')).toBeVisible();

    // --- Step 3 (The Brain at Work) ---
    // The API is now fully automated. We can check the dashboard map to verify hotspots or routed paths.
    await page.locator('text="Dashboard"').click({ force: true });
    await expect(page.locator('.leaflet-container')).toBeVisible();

    // Assert polyline connects Farmer to Equipment
    await expect(page.locator('path.leaflet-interactive').first()).toBeAttached({ timeout: 15000 });
    const pathCount = await page.locator('path.leaflet-interactive').count();
    expect(pathCount).toBeGreaterThan(0);

    // --- Step 5 (Closing the Loop) ---
    await page.locator('text="Requests"').first().click({ force: true });

    const completePromise = page.waitForResponse(response =>
      response.url().includes('complete') && response.request().method() === 'PUT'
    );

    const updatedRequestRow = page.locator('tr').filter({ hasText: '9999999999' }).first();
    await expect(updatedRequestRow).toBeVisible();

    // Verify and click complete
    const completeButton = updatedRequestRow.locator('button:has-text("Complete Job")');
    await expect(completeButton).toBeVisible();
    await completeButton.click();

    const completeRes = await completePromise;
    expect(completeRes.status()).toBe(200);

    // Ensure DB badge changes
    await expect(updatedRequestRow.locator('span:has-text("Completed")')).toBeVisible({ timeout: 15000 });
    await expect(completeButton).toBeHidden();
  });

}); // 4. This closes the describe block
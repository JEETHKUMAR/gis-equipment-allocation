import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.beforeAll(() => {
  // Seed the database to ensure a Harvester is always available for the test run
  const scriptPath = path.resolve(__dirname, '../../api-gateway/insert_chandigarh.js');
  execSync(`node "${scriptPath}"`);
});

test('End-to-End Logistics Loop', async ({ page }) => {
  // 1. Farmer Flow
  await page.goto('http://localhost:3000/');
  
  // Click Farmer App View if not default
  await page.click('button:has-text("Farmer App View")');

  // Login
  await page.fill('input[placeholder="+91 99999 99999"]', '9999999999');
  await page.click('button:has-text("Send OTP")');
  
  await page.fill('input[placeholder="• • • • • •"]', '123456');
  await page.click('button:has-text("Secure Login")');

  // Assert equipment page loads
  await expect(page.locator('h2:has-text("Request Equipment")')).toBeVisible();

  // Select equipment
  await page.selectOption('select', 'Harvester');

  // Click map to drop pin. wait for leaflet to be stable
  await page.waitForSelector('.leaflet-container');
  // Click slightly offset from center
  await page.locator('.leaflet-container').click({ position: { x: 200, y: 200 } });

  // Submit request
  await page.click('button:has-text("Submit Request")');
  
  // Expect toast confirmation
  await expect(page.getByText(/Request confirmed/i)).toBeVisible({ timeout: 10000 });

  // Wait a moment for DB persistence
  await page.waitForTimeout(1000);

  // 2. Admin Flow
  // Logout from farmer view
  await page.click('button:has-text("Logout")');
  
  // Back to landing page, click Admin Dashboard View
  await page.click('button:has-text("Admin Dashboard View")');
  
  // Admin Login
  await page.fill('input[placeholder="admin"]', 'admin');
  await page.fill('input[placeholder="••••••••"]', 'admin123');
  await page.click('button:has-text("Secure Login")');

  // Verify Admin Dashboard loads
  await expect(page.locator('text=AgriConnect Admin')).toBeVisible();

  // 3. The Brain Flow - Requests
  await page.locator('text="Requests"').first().click({ force: true });
  
  // Find the request row we just made (Harvester) and check that it's already Allocated
  const requestRow = page.locator('tr').filter({ hasText: '9999999999' }).first();
  await expect(requestRow).toBeVisible();
  
  // With automated dispatch, it should be Allocated automatically
  await expect(requestRow.locator('span:has-text("Allocated")').first()).toBeVisible({ timeout: 15000 });

  // 4. Map Flow
  // The tab is labeled "Dashboard"
  await page.locator('text="Dashboard"').click({ force: true });
  
  // Assert Map is visible
  await expect(page.locator('.leaflet-container')).toBeVisible();
  
  // Wait for polyline (it uses svg path with leaflet-interactive class)
  await expect(page.locator('path.leaflet-interactive').first()).toBeAttached({ timeout: 15000 });
  
  const pathCount = await page.locator('path.leaflet-interactive').count();
  expect(pathCount).toBeGreaterThan(0);

  // 5. Complete Job Flow
  // The tab is labeled "Requests" again
  await page.locator('text="Requests"').first().click({ force: true });

  // Get the row again to avoid staleness
  const updatedRequestRow = page.locator('tr').filter({ hasText: '9999999999' }).first();
  await expect(updatedRequestRow).toBeVisible();

  // Verify the Complete Job button is visible
  const completeButton = updatedRequestRow.locator('button:has-text("Complete Job")');
  await expect(completeButton).toBeVisible();

  // Click it to complete the job
  await completeButton.click();

  // It should update to Completed badge
  await expect(page.locator('span:has-text("Completed")').first()).toBeVisible({ timeout: 15000 });
  // The button should go away too
  await expect(completeButton).toBeHidden();
});

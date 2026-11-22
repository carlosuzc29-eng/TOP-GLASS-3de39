import { expect, test } from '@playwright/test';

test('complete end-to-end window tint quote and booking flow', async ({ page }) => {
  await page.goto('/quote');

  // Step 0: Location -> Princeton, TX (default) -> Continue
  await expect(page.getByRole('heading', { name: /Design your tint/i })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).first().click();

  // Step 1: Search vehicle "RAV4 2023"
  await page.getByPlaceholder(/RAV4 2023/i).fill('RAV4 2023');
  await page.getByRole('button', { name: /Toyota RAV4/i }).first().click();

  // Step 2: Full car
  await page.getByRole('button', { name: /Full Car/i }).click();

  // Step 3: Ceramic Pro ($675)
  await page.getByRole('button', { name: /Ceramic Pro/i }).click();
  await expect(page.getByText('$675').first()).toBeVisible();

  // Step 4: Shades -> Continue
  await page.getByRole('button', { name: 'Continue' }).first().click();

  // Step 5: Add-ons -> Continue
  await page.getByRole('button', { name: 'Continue' }).first().click();

  // Step 6: Select first available time slot
  await page.getByRole('button', { name: /AM|PM/ }).first().click();

  // Step 7: Customer details
  await page.getByPlaceholder('Alex Morgan').fill('Alex Morgan');
  await page.getByPlaceholder('+14695550199').fill('+14695550199');
  await page.getByPlaceholder('alex@example.com').fill('alex@example.com');
  const checkboxes = page.getByRole('checkbox');
  await checkboxes.nth(0).check();
  await checkboxes.nth(1).check();
  await page.getByRole('button', { name: 'Continue' }).first().click();

  // Step 8: Pay $50 deposit
  await page.getByRole('button', { name: /Pay \$50 deposit/i }).click();

  // Should arrive on confirmation page
  await expect(page).toHaveURL(/\/my-appointment\//);
  await expect(page.getByText(/Your bay is reserved/i)).toBeVisible();
});

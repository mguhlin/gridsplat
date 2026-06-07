import { expect, test } from '@playwright/test';

test('shows the EasySheet foundation page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'EasySheet' })).toBeVisible();
});

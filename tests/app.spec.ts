import { expect, test } from '@playwright/test';

test.beforeEach(async ({ context, page }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
});

test('enters data, selects a range, copies, pastes, and undoes on desktop', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium',
    'Desktop flow runs in Chromium.',
  );

  await expect(page.getByRole('heading', { name: 'EasySheet' })).toBeVisible();

  await page.getByTestId('cell-A1').click();
  await page.getByLabel('Edit cell A1').fill('5');
  await page.getByLabel('Edit cell A1').press('Enter');

  await page.getByTestId('cell-A2').click();
  await page.getByLabel('Edit cell A2').fill('Apples');
  await page.getByLabel('Edit cell A2').press('Enter');

  await page.getByTestId('cell-B1').click();
  await page.getByLabel('Edit cell B1').fill('6');
  await page.getByLabel('Edit cell B1').press('Enter');

  const a1 = await page.getByTestId('cell-A1').boundingBox();
  const b2 = await page.getByTestId('cell-B2').boundingBox();

  if (!a1 || !b2) {
    throw new Error('Expected grid cells to be visible');
  }

  await page.mouse.move(a1.x + a1.width / 2, a1.y + a1.height / 2);
  await page.mouse.down();
  await page.mouse.move(b2.x + b2.width / 2, b2.y + b2.height / 2);
  await page.mouse.up();

  await page.keyboard.press('ControlOrMeta+C');
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe('5\t6\nApples\t');

  await page.getByTestId('cell-C1').click();
  await page.getByLabel('Edit cell C1').press('Escape');
  await page.locator('[role="grid"]').focus();
  await page.evaluate(() => navigator.clipboard.writeText('9\t10\n11\t12'));
  await page.keyboard.press('ControlOrMeta+V');

  await expect(page.getByTestId('cell-C1')).toContainText('9');
  await expect(page.getByTestId('cell-D2')).toContainText('12');

  await page.getByRole('button', { name: 'Undo' }).click();

  await expect(page.getByTestId('cell-C1')).not.toContainText('9');
  await expect(page.getByTestId('cell-D2')).not.toContainText('12');
});

test('opens a roomy editor from a mobile tap', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'mobile-chrome',
    'Mobile tap flow runs in mobile Chrome.',
  );

  await page.getByTestId('cell-A1').tap();

  const editor = page.getByLabel('Edit cell A1');
  await expect(editor).toBeVisible();
  await expect(editor).toHaveCSS('min-height', '48px');

  await editor.fill('7');
  await editor.press('Enter');

  await expect(page.getByTestId('cell-A1')).toContainText('7');
});

import { expect, type Page, test } from '@playwright/test';

test.beforeEach(async ({ context, page }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
});

async function dismissSplash(page: Page) {
  await page.getByRole('button', { name: 'New Sheet' }).click();
  await expect(page.getByRole('dialog', { name: 'EasySheet' })).toBeHidden();
}

test('shows the welcome splash and opens toolbar help by keyboard', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium',
    'Shell flow runs in Chromium.',
  );

  await expect(page.getByRole('dialog', { name: 'EasySheet' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'New Sheet' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open a File' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Try an Activity' }),
  ).toBeVisible();

  await dismissSplash(page);
  await expect(page.getByText('New sheet ready.')).toBeVisible();

  await page.getByRole('button', { name: 'Help' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu', { name: 'Help menu' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Quick help' }).click();
  await expect(
    page.getByRole('dialog', { name: 'EasySheet Help' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await expect(
    page.getByRole('dialog', { name: 'EasySheet Help' }),
  ).toBeHidden();
});

test('opens activity dialog from the splash on touch', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'mobile-chrome',
    'Splash touch flow runs in mobile Chrome.',
  );

  await page.getByRole('button', { name: 'Try an Activity' }).tap();
  await expect(
    page.getByRole('dialog', { name: 'Try an Activity' }),
  ).toBeVisible();
  await expect(page.getByText('Class Survey')).toBeVisible();
});

test('enters data, selects a range, copies, pastes, and undoes on desktop', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium',
    'Desktop flow runs in Chromium.',
  );

  await expect(
    page.getByRole('heading', { level: 1, name: 'EasySheet' }),
  ).toBeVisible();
  await dismissSplash(page);

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

  await dismissSplash(page);
  await page.getByTestId('cell-A1').tap();

  const editor = page.getByLabel('Edit cell A1');
  await expect(editor).toBeVisible();
  await expect(editor).toHaveCSS('min-height', '48px');

  await editor.fill('7');
  await editor.press('Enter');

  await expect(page.getByTestId('cell-A1')).toContainText('7');
});

test('calculates formulas live and shows friendly errors', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium',
    'Formula flow runs in Chromium.',
  );

  await dismissSplash(page);
  await page.getByTestId('cell-A1').click();
  await page.getByLabel('Edit cell A1').fill('5');
  await page.getByLabel('Edit cell A1').press('Enter');

  await page.getByTestId('cell-A2').click();
  await page.getByLabel('Edit cell A2').fill('6');
  await page.getByLabel('Edit cell A2').press('Enter');

  await page.getByTestId('cell-B1').click();
  await page.getByLabel('Edit cell B1').fill('=SUM(A1:A2)');
  await page.getByLabel('Edit cell B1').press('Enter');

  await expect(page.getByTestId('cell-B1')).toContainText('11');

  await page.getByTestId('cell-A1').click();
  await page.getByLabel('Edit cell A1').fill('7');
  await page.getByLabel('Edit cell A1').press('Enter');

  await expect(page.getByTestId('cell-B1')).toContainText('13');

  await page.getByTestId('cell-C1').click();
  await page.getByLabel('Edit cell C1').fill('=1/0');
  await page.getByLabel('Edit cell C1').press('Enter');

  await expect(page.getByTestId('cell-C1')).toContainText(
    "You can't divide by zero. Check your numbers.",
  );
});

test('imports CSV and pastes Markdown tables', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium',
    'Import flow runs in Chromium.',
  );

  await dismissSplash(page);

  await page.locator('input[type="file"]').setInputFiles({
    name: 'fruit.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('Name,Count\nApples,4\nBananas,6'),
  });

  await expect(page.getByTestId('cell-A1')).toContainText('Name');
  await expect(page.getByTestId('cell-B3')).toContainText('6');
  await expect(page.getByText('Opened fruit.csv.')).toBeVisible();

  await page.getByTestId('cell-C1').click();
  await page.getByLabel('Edit cell C1').press('Escape');
  await page.locator('[role="grid"]').focus();
  await page.evaluate(() =>
    navigator.clipboard.writeText(
      '| Item | Count |\n| --- | --- |\n| Pears | 5 |',
    ),
  );
  await page.keyboard.press('ControlOrMeta+V');

  await expect(page.getByTestId('cell-C1')).toContainText('Item');
  await expect(page.getByTestId('cell-D2')).toContainText('5');
  await expect(page.getByText('Pasted table into the sheet.')).toBeVisible();
});

test('creates a live-updating bar chart and exports PNG', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium',
    'Chart flow runs in Chromium.',
  );

  await dismissSplash(page);

  await page.locator('input[type="file"]').setInputFiles({
    name: 'fruit.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('Fruit,Count\nApples,4\nBananas,6\nPears,3'),
  });

  const a1 = await page.getByTestId('cell-A2').boundingBox();
  const b3 = await page.getByTestId('cell-B4').boundingBox();

  if (!a1 || !b3) {
    throw new Error('Expected chart source cells to be visible');
  }

  await page.mouse.move(a1.x + a1.width / 2, a1.y + a1.height / 2);
  await page.mouse.down();
  await page.mouse.move(b3.x + b3.width / 2, b3.y + b3.height / 2);
  await page.mouse.up();

  await page
    .getByLabel('Chart picker')
    .getByLabel('Chart title')
    .fill('Fruit Count');
  await page.getByRole('button', { name: 'Bar' }).click();

  await expect(page.getByLabel('Chart preview')).toBeVisible();
  await expect(
    page.getByRole('table', { name: 'Fruit Count data' }),
  ).toContainText('Bananas');
  await expect(
    page.getByRole('table', { name: 'Fruit Count data' }),
  ).toContainText('6');

  await page.getByTestId('cell-B3').click();
  await page.getByLabel('Edit cell B3').fill('9');
  await page.getByLabel('Edit cell B3').press('Enter');

  await expect(
    page.getByRole('table', { name: 'Fruit Count data' }),
  ).toContainText('9');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export Chart PNG' }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe('easysheet-chart.png');
});

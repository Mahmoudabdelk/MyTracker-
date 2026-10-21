/* Run real browser workflows against a temporary, isolated local server. */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const net = require('node:net');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright-core');

const root = path.resolve(__dirname, '..');
const key = 'fareeq.hr.v1';
let server;
let browser;
let page;
let passed = 0;
let skipped = 0;
const errors = [];
const readState = () =>
  page.evaluate((k) => JSON.parse(localStorage.getItem(k)), key);
const field = (form, name) => page.locator(`#${form} [name="${name}"]`);
const closeModal = () =>
  page.locator('#modal [data-action="close-modal"]').first().click();

async function test(name, run) {
  const result = await run();
  if (result?.skip) {
    skipped++;
    console.log(`SKIP - ${name}: ${result.skip}`);
    return;
  }
  passed++;
  console.log(`ok ${passed} - ${name}`);
}

async function navigate(view) {
  await page.evaluate((view) => {
    location.hash = view;
  }, view);
  await page.waitForFunction(
    (view) =>
      document
        .querySelector(`[data-view="${view}"]`)
        .getAttribute('aria-current') === 'page',
    view,
  );
}

async function submit(form) {
  await page.locator(`#${form} button[type="submit"]`).click();
}

async function createEmployee(values = {}) {
  await page.locator('#page-actions [data-action="add-employee"]').click();
  const data = {
    name: 'اختبار الموارد البشرية',
    email: 'hr.test@example.com',
    title: 'أخصائي اختبار',
    department: 'قسم الاختبار',
    salary: '12500',
    ...values,
  };
  for (const [name, value] of Object.entries(data))
    await field('employee-form', name).fill(value);
  await submit('employee-form');
  await page.waitForFunction(() => !document.querySelector('#modal').open);
  return (await readState()).employees.find((e) => e.email === data.email);
}

async function chooseImport(payload) {
  const choosing = page.waitForEvent('filechooser');
  await page.locator('[data-action="import"]').click();
  const chooser = await choosing;
  await chooser.setFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(payload)),
  });
}

async function freePort() {
  return new Promise((resolve, reject) => {
    const listener = net.createServer();
    listener.once('error', reject);
    listener.listen(0, '127.0.0.1', () => {
      const port = listener.address().port;
      listener.close(() => resolve(port));
    });
  });
}

async function main() {
  let url = process.env.TEST_URL;
  if (!url) {
    const port = await freePort();
    server = spawn(
      'python3',
      [
        '-m',
        'http.server',
        String(port),
        '--bind',
        '127.0.0.1',
        '--directory',
        root,
      ],
      { stdio: 'ignore' },
    );
    let launchError;
    server.on('error', (error) => {
      launchError = error;
    });
    url = `http://127.0.0.1:${port}`;
    let ready = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      if (launchError) throw launchError;
      try {
        if ((await fetch(url)).ok) {
          ready = true;
          break;
        }
      } catch {
        /* Wait briefly for the child server. */
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.ok(ready, 'Temporary HTTP server did not start');
  }

  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
    acceptDownloads: true,
  });
  page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(url);
  await page.locator('.stat-card').first().waitFor();
  let employee;
  let backup;
  let leave;

  await test('dashboard uses persisted sample data and real attendance totals', async () => {
    const data = await readState();
    assert.equal(data.employees.length, 12);
    assert.equal(data.leaves.filter((l) => l.status === 'pending').length, 2);
    assert.equal(await page.locator('#storage-warning').isVisible(), false);
    assert.equal(await page.locator('.stat-card').count(), 4);
    assert.equal(await page.locator('tbody tr').count(), 5);
    assert.equal(await page.locator('.department-line').count(), 7);
  });

  await test('every navigation section renders', async () => {
    for (const view of [
      'employees',
      'attendance',
      'leaves',
      'reports',
      'settings',
      'dashboard',
    ]) {
      await navigate(view);
      assert.ok((await page.locator('#page-title').textContent()).length > 2);
      assert.ok(
        (await page.locator('#view-content').textContent()).length > 20,
      );
    }
  });

  await test('employee creation persists a complete record', async () => {
    await navigate('employees');
    employee = await createEmployee();
    assert.ok(employee.id);
    assert.equal(employee.code, 'HR-013');
    assert.equal(employee.salary, 12500);
    assert.equal((await readState()).employees.length, 13);
    assert.equal(await page.locator('tbody tr').count(), 13);
  });

  await test('duplicate email and whitespace-only names are rejected', async () => {
    await page.locator('#page-actions [data-action="add-employee"]').click();
    for (const [name, value] of Object.entries({
      name: 'موظف مكرر',
      email: 'HR.TEST@example.com',
      title: 'اختبار',
      department: 'اختبار',
      salary: '1000',
    }))
      await field('employee-form', name).fill(value);
    await submit('employee-form');
    assert.match(await page.locator('#form-error').textContent(), /مستخدم/);
    await field('employee-form', 'email').fill('different@example.com');
    await field('employee-form', 'name').fill('   ');
    await submit('employee-form');
    assert.match(await page.locator('#form-error').textContent(), /الاسم/);
    assert.equal((await readState()).employees.length, 13);
    await closeModal();
  });

  await test('employee editing, search and department filters work', async () => {
    await page
      .locator(`[data-action="edit-employee"][data-id="${employee.id}"]`)
      .click();
    await field('employee-form', 'salary').fill('16500');
    await submit('employee-form');
    assert.equal(
      (await readState()).employees.find((e) => e.id === employee.id).salary,
      16500,
    );
    await page.locator('#department-filter').selectOption('قسم الاختبار');
    assert.equal(await page.locator('tbody tr').count(), 1);
    await page.locator('#global-search').fill('nothing-matches-this');
    assert.equal(await page.locator('tbody tr').count(), 0);
    await page.locator('#global-search').fill('اختبار');
    assert.equal(await page.locator('tbody tr').count(), 1);
    await page.locator('#global-search').fill('');
  });

  await test('attendance records persist check-in and check-out times', async () => {
    await navigate('attendance');
    const row = page.locator(`[data-employee-row="${employee.id}"]`);
    await row.locator('select').selectOption('present');
    await row.locator('.check-in').fill('08:45');
    await row.locator('.check-out').fill('17:10');
    await row.locator('[data-action="save-attendance-row"]').click();
    const record = (await readState()).attendance.find(
      (a) => a.employeeId === employee.id,
    );
    assert.equal(record.status, 'present');
    assert.equal(record.checkIn, '08:45');
    assert.equal(record.checkOut, '17:10');
  });

  await test('invalid time ordering cannot replace a valid attendance record', async () => {
    const row = page.locator(`[data-employee-row="${employee.id}"]`);
    await row.locator('.check-out').fill('07:00');
    await row.locator('[data-action="save-attendance-row"]').click();
    assert.match(await page.locator('#toast').textContent(), /بعد وقت الحضور/);
    assert.equal(
      (await readState()).attendance.find((a) => a.employeeId === employee.id)
        .checkOut,
      '17:10',
    );
  });

  await test('unrecorded removes attendance and absence clears time fields', async () => {
    let row = page.locator(`[data-employee-row="${employee.id}"]`);
    await row.locator('select').selectOption('unrecorded');
    await row.locator('[data-action="save-attendance-row"]').click();
    assert.equal(
      (await readState()).attendance.some((a) => a.employeeId === employee.id),
      false,
    );
    await page.locator('#page-actions [data-action="add-attendance"]').click();
    await field('attendance-form', 'employeeId').selectOption(employee.id);
    await field('attendance-form', 'status').selectOption('absent');
    assert.equal(await field('attendance-form', 'checkIn').isDisabled(), true);
    await submit('attendance-form');
    const record = (await readState()).attendance.find(
      (a) => a.employeeId === employee.id,
    );
    assert.equal(record.status, 'absent');
    assert.equal(record.checkIn, '');
    assert.equal(record.checkOut, '');
  });

  await test('future attendance dates are rejected', async () => {
    const current = await page.locator('#attendance-date').inputValue();
    await page.locator('#attendance-date').fill('2099-01-01');
    await page.locator('#attendance-date').dispatchEvent('change');
    assert.equal(await page.locator('#attendance-date').inputValue(), current);
  });

  await test('leave form rejects an end date before its start date', async () => {
    await navigate('leaves');
    await page.locator('#page-actions [data-action="add-leave"]').click();
    await field('leave-form', 'employeeId').selectOption(employee.id);
    await field('leave-form', 'from').fill('2090-05-05');
    await field('leave-form', 'to').fill('2090-05-04');
    await submit('leave-form');
    assert.match(
      await page.locator('#form-error').textContent(),
      /تاريخ النهاية/,
    );
  });

  await test('leave requests are created, approved and protected against overlap', async () => {
    await field('leave-form', 'to').fill('2090-05-07');
    await field('leave-form', 'reason').fill('إجازة للاختبار');
    await submit('leave-form');
    leave = (await readState()).leaves.find(
      (l) => l.employeeId === employee.id,
    );
    assert.equal(leave.status, 'pending');
    await page
      .locator(`[data-action="approve-leave"][data-id="${leave.id}"]`)
      .click();
    assert.equal(
      (await readState()).leaves.find((l) => l.id === leave.id).status,
      'approved',
    );
    await page.locator('#page-actions [data-action="add-leave"]').click();
    await field('leave-form', 'employeeId').selectOption(employee.id);
    await field('leave-form', 'from').fill('2090-05-06');
    await field('leave-form', 'to').fill('2090-05-09');
    await submit('leave-form');
    assert.match(await page.locator('#form-error').textContent(), /يتداخل/);
    await closeModal();
  });

  await test('leave rejection requires confirmation and updates its status', async () => {
    const pending = (await readState()).leaves.find(
      (l) => l.status === 'pending',
    );
    await page
      .locator(`[data-action="reject-leave"][data-id="${pending.id}"]`)
      .click();
    assert.equal(
      (await readState()).leaves.find((l) => l.id === pending.id).status,
      'pending',
    );
    await page.locator('#modal [data-action="confirm"]').click();
    assert.equal(
      (await readState()).leaves.find((l) => l.id === pending.id).status,
      'rejected',
    );
  });

  await test('settings and application data survive page reloads', async () => {
    await navigate('settings');
    await field('settings-form', 'company').fill('شركة الاختبار');
    await field('settings-form', 'currency').selectOption('SAR');
    await submit('settings-form');
    await page.reload();
    await page.locator('#settings-form').waitFor();
    const data = await readState();
    assert.equal(data.settings.company, 'شركة الاختبار');
    assert.equal(data.settings.currency, 'SAR');
    assert.equal(data.employees.length, 13);
    assert.equal(data.leaves.find((l) => l.id === leave.id).status, 'approved');
    assert.equal(
      await page.locator('#workspace-name').textContent(),
      'شركة الاختبار',
    );
  });

  await test('employee text is escaped rather than executed as HTML', async () => {
    await navigate('employees');
    await page
      .locator(`[data-action="edit-employee"][data-id="${employee.id}"]`)
      .click();
    const payload = '<img src=x onerror="window.__xss=1">';
    await field('employee-form', 'name').fill(payload);
    await submit('employee-form');
    assert.equal(await page.locator('tbody img').count(), 0);
    assert.equal(await page.evaluate(() => window.__xss), undefined);
    assert.ok((await page.locator('tbody').textContent()).includes(payload));
  });

  await test('CSV export includes records and neutralizes spreadsheet formulas', async () => {
    await page
      .locator(`[data-action="edit-employee"][data-id="${employee.id}"]`)
      .click();
    await field('employee-form', 'name').fill('=SUM(1,2)');
    await submit('employee-form');
    const downloaded = page.waitForEvent('download');
    await page
      .locator('#page-actions [data-action="export-employees"]')
      .click();
    const file = await downloaded;
    const csv = await fs.readFile(await file.path(), 'utf8');
    assert.ok(csv.includes('"\'=SUM(1,2)"'));
    assert.ok(csv.includes('hr.test@example.com'));
    assert.equal(csv.split('\r\n').length, 14);
  });

  await test('attendance CSV matches the selected date and actual statuses', async () => {
    await navigate('attendance');
    const downloaded = page.waitForEvent('download');
    await page
      .locator('#page-actions [data-action="export-attendance"]')
      .click();
    const file = await downloaded;
    const csv = await fs.readFile(await file.path(), 'utf8');
    assert.ok(csv.includes('غائب'));
    assert.ok(csv.includes('HR-013'));
    assert.equal(csv.split('\r\n').length, 14);
  });

  await test('JSON backup exports a restorable copy of the complete workspace', async () => {
    await navigate('settings');
    const downloaded = page.waitForEvent('download');
    await page.locator('#view-content [data-action="backup"]').click();
    const file = await downloaded;
    backup = JSON.parse(await fs.readFile(await file.path(), 'utf8'));
    assert.deepEqual(backup, await readState());
  });

  await test('invalid backup data is rejected without changing stored data', async () => {
    const invalid = structuredClone(backup);
    invalid.attendance[0].employeeId = 'missing-employee';
    await chooseImport(invalid);
    await page.waitForFunction(() =>
      document.querySelector('#toast').textContent.includes('ليس نسخة'),
    );
    assert.deepEqual(await readState(), backup);
  });

  await test('restore replaces data only after explicit confirmation', async () => {
    const restored = structuredClone(backup);
    restored.settings.company = 'الشركة المستعادة';
    await chooseImport(restored);
    await page.locator('#modal [data-action="confirm"]').waitFor();
    assert.equal((await readState()).settings.company, 'شركة الاختبار');
    await page.locator('#modal [data-action="confirm"]').click();
    assert.equal((await readState()).settings.company, 'الشركة المستعادة');
    assert.equal(
      await page.locator('#workspace-name').textContent(),
      'الشركة المستعادة',
    );
  });

  await test('employee deletion removes associated attendance and leave records', async () => {
    await navigate('employees');
    await page
      .locator(`[data-action="employee-details"][data-id="${employee.id}"]`)
      .click();
    await page.locator('#modal [data-action="delete-employee"]').click();
    await page.locator('#modal [data-action="confirm"]').click();
    const data = await readState();
    assert.equal(
      data.employees.some((e) => e.id === employee.id),
      false,
    );
    assert.equal(
      data.attendance.some((a) => a.employeeId === employee.id),
      false,
    );
    assert.equal(
      data.leaves.some((l) => l.employeeId === employee.id),
      false,
    );
  });

  await test('clearing demo data renders meaningful empty states and zero totals', async () => {
    await navigate('settings');
    await page.locator('[data-action="clear-data"]').click();
    await page.locator('#modal [data-action="confirm"]').click();
    assert.equal((await readState()).employees.length, 0);
    assert.equal((await readState()).demo, false);
    await navigate('dashboard');
    assert.ok(
      (await page.locator('#view-content').textContent()).includes(
        'لا يوجد موظفون',
      ),
    );
    assert.equal(
      await page
        .locator('#view-content')
        .textContent()
        .then((t) => /NaN|undefined/.test(t)),
      false,
    );
    await navigate('reports');
    assert.equal(
      await page
        .locator('#view-content')
        .textContent()
        .then((t) => /NaN|undefined/.test(t)),
      false,
    );
  });

  await test('storage failures are reported and do not claim a successful save', async () => {
    await navigate('settings');
    const before = await readState();
    await page.evaluate(() => {
      Storage.prototype.setItem = () => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      };
    });
    await field('settings-form', 'company').fill('لن يتم الحفظ');
    await submit('settings-form');
    assert.equal(await page.locator('#storage-warning').isVisible(), true);
    assert.deepEqual(await readState(), before);
    assert.match(await page.locator('#toast').textContent(), /لم يتم الحفظ/);
  });

  await test('mobile layouts, menu navigation and desktop views have no page overflow', async () => {
    const responsiveContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const responsivePage = await responsiveContext.newPage();
    responsivePage.on('pageerror', (e) => errors.push(e.message));
    await responsivePage.goto(url);
    await responsivePage.locator('.stat-card').first().waitFor();
    await fs.mkdir(path.join(root, 'test-results'), { recursive: true });
    for (const width of [360, 390, 768, 1440]) {
      await responsivePage.setViewportSize({
        width,
        height: width > 1000 ? 1050 : 844,
      });
      for (const view of [
        'dashboard',
        'employees',
        'attendance',
        'leaves',
        'reports',
        'settings',
      ]) {
        await responsivePage.evaluate((view) => {
          location.hash = view;
        }, view);
        await responsivePage.waitForFunction(
          (view) =>
            document
              .querySelector(`[data-view="${view}"]`)
              .getAttribute('aria-current') === 'page',
          view,
        );
        assert.equal(
          await responsivePage.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
          `${view} overflows at ${width}px`,
        );
      }
    }
    await responsivePage.setViewportSize({ width: 390, height: 844 });
    await responsivePage.locator('#menu-toggle').click();
    assert.equal(
      await responsivePage
        .locator('#menu-toggle')
        .getAttribute('aria-expanded'),
      'true',
    );
    await responsivePage.locator('nav [data-view="employees"]').click();
    await responsivePage.waitForFunction(
      () =>
        document.querySelector('#menu-toggle').getAttribute('aria-expanded') ===
        'false',
    );
    assert.equal(
      await responsivePage
        .locator('#menu-toggle')
        .getAttribute('aria-expanded'),
      'false',
    );
    await responsivePage.evaluate(() => {
      location.hash = 'dashboard';
    });
    await responsivePage.locator('.welcome-strip').waitFor();
    await responsivePage.screenshot({
      path: path.join(root, 'test-results', 'mobile.png'),
      fullPage: true,
      animations: 'disabled',
    });
    await responsivePage.setViewportSize({ width: 1440, height: 1050 });
    await responsivePage.screenshot({
      path: path.join(root, 'test-results', 'desktop.png'),
      fullPage: true,
      animations: 'disabled',
    });
    await responsiveContext.close();
  });

  await test('standalone HTML runs with no external assets and saves employee data', async () => {
    const standalonePage = await browser.newPage();
    const resources = [];
    standalonePage.on('request', (request) => resources.push(request.url()));
    standalonePage.on('pageerror', (e) => errors.push(e.message));
    await standalonePage.goto(`${url}/dist/HR-System.html#employees`);
    await standalonePage.locator('#department-filter').waitFor();
    assert.equal(await standalonePage.locator('tbody tr').count(), 12);
    assert.equal(
      resources.filter((resource) =>
        /styles\.css|app\.js|favicon\.svg/.test(resource),
      ).length,
      0,
    );
    await standalonePage
      .locator('#page-actions [data-action="add-employee"]')
      .click();
    for (const [name, value] of Object.entries({
      name: 'موظف النسخة المستقلة',
      email: 'standalone@example.com',
      title: 'اختبار',
      department: 'اختبار',
      salary: '1000',
    })) {
      await standalonePage
        .locator(`#employee-form [name="${name}"]`)
        .fill(value);
    }
    await standalonePage
      .locator('#employee-form button[type="submit"]')
      .click();
    assert.equal(
      await standalonePage.evaluate(
        (k) => JSON.parse(localStorage.getItem(k)).employees.length,
        key,
      ),
      13,
    );
    await standalonePage.reload();
    await standalonePage.locator('#department-filter').waitFor();
    assert.equal(await standalonePage.locator('tbody tr').count(), 13);
    await standalonePage.close();
  });

  await test('optional file:// launch works when browser administration permits it', async () => {
    const localPage = await browser.newPage();
    const external = [];
    localPage.on('request', (request) => {
      if (/^https?:/.test(request.url())) external.push(request.url());
    });
    localPage.on('pageerror', (e) => errors.push(e.message));
    try {
      await localPage.goto(`file://${path.join(root, 'index.html')}`);
    } catch (error) {
      if (!error.message.includes('ERR_BLOCKED_BY_ADMINISTRATOR')) throw error;
      await localPage.close();
      return {
        skip: 'This environment blocks file:// navigation by browser policy. HTTP workflows were tested separately.',
      };
    }
    await localPage.locator('.stat-card').first().waitFor();
    assert.equal(
      await localPage.locator('#storage-warning').isVisible(),
      false,
    );
    assert.deepEqual(external, []);
    await localPage.close();
  });

  await test('no uncaught JavaScript errors occurred during the workflows', async () => {
    assert.deepEqual(errors, []);
  });
  console.log(
    `\n${passed} browser checks passed; ${skipped} optional checks skipped. Screenshots: test-results/`,
  );
}

main()
  .catch(async (error) => {
    console.error(`\nFAIL after ${passed} checks:`, error);
    if (page && !page.isClosed()) {
      await fs.mkdir(path.join(root, 'test-results'), { recursive: true });
      await page
        .screenshot({
          path: path.join(root, 'test-results', 'failure.png'),
          fullPage: true,
        })
        .catch(() => {});
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    if (browser) await browser.close();
    if (server) server.kill();
  });

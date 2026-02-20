import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium, type BrowserContext } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const extensionPath = path.join(__dirname, '../../.output/chrome-mv3');

test.describe('Extension Loading', () => {
  let context: BrowserContext;

  test.beforeAll(async () => {
    // Launch Chrome with extension loaded
    context = await chromium.launchPersistentContext('', {
      headless: false, // Extensions require headed mode
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('extension should load without errors', async () => {
    const page = await context.newPage();

    // Check for extension errors in console
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('https://example.com');
    await page.waitForTimeout(2000); // Wait for extension to initialize

    // Verify no extension errors
    const extensionErrors = errors.filter(
      (e) =>
        e.includes('chrome-extension://') || e.includes('Extension context'),
    );
    expect(extensionErrors).toHaveLength(0);
  });

  test('background service worker should be active', async () => {
    const serviceWorker = context.serviceWorkers()[0];
    expect(serviceWorker).toBeDefined();
  });
});

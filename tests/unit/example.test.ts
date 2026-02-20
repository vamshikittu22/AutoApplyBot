import { describe, it, expect, beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing';

describe('WXT Testing Infrastructure', () => {
  beforeEach(() => {
    // Reset fake browser state before each test
    fakeBrowser.reset();
  });

  it('should have access to browser.runtime API', () => {
    expect(fakeBrowser.runtime).toBeDefined();
    expect(fakeBrowser.runtime.id).toBeDefined();
  });

  it('should mock chrome.storage.local API', async () => {
    const testData = { key: 'value' };

    // Write to fake storage
    await fakeBrowser.storage.local.set(testData);

    // Read from fake storage
    const result = await fakeBrowser.storage.local.get('key');

    expect(result.key).toBe('value');
  });

  it('should isolate storage between tests', async () => {
    // This test should not see data from previous test
    const result = await fakeBrowser.storage.local.get('key');
    expect(result.key).toBeUndefined();
  });
});

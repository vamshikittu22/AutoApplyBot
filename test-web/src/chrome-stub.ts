/**
 * Chrome API stub for the test-web harness.
 *
 * Replaces chrome.storage.local  →  browser localStorage
 * Replaces chrome.runtime.*      →  no-ops
 *
 * Must be imported BEFORE any extension code that calls chrome.*
 */

const LS_PREFIX = '__autoapply__';

const chromeMock = {
  storage: {
    local: {
      async get(keys: string | string[] | null): Promise<Record<string, unknown>> {
        const result: Record<string, unknown> = {};
        const keyList = Array.isArray(keys)
          ? keys
          : typeof keys === 'string'
          ? [keys]
          : Object.keys(localStorage).filter((k) => k.startsWith(LS_PREFIX)).map((k) => k.slice(LS_PREFIX.length));

        for (const key of keyList) {
          const raw = localStorage.getItem(LS_PREFIX + key);
          if (raw !== null) {
            try { result[key] = JSON.parse(raw); } catch { result[key] = raw; }
          }
        }
        return result;
      },

      async set(items: Record<string, unknown>): Promise<void> {
        for (const [key, value] of Object.entries(items)) {
          localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
        }
      },

      async clear(): Promise<void> {
        const toRemove = Object.keys(localStorage).filter((k) => k.startsWith(LS_PREFIX));
        toRemove.forEach((k) => localStorage.removeItem(k));
      },

      async remove(keys: string | string[]): Promise<void> {
        const keyList = Array.isArray(keys) ? keys : [keys];
        keyList.forEach((k) => localStorage.removeItem(LS_PREFIX + k));
      },
    },
  },

  runtime: {
    openOptionsPage: () => console.log('[chrome-stub] openOptionsPage() called'),
    sendMessage: (...args: unknown[]) => console.log('[chrome-stub] sendMessage', args),
    onMessage: {
      addListener: () => {},
      removeListener: () => {},
    },
    onInstalled: {
      addListener: () => {},
    },
  },

  tabs: {
    query: async () => [],
    sendMessage: () => {},
  },

  action: {
    setBadgeText: async () => {},
    setBadgeBackgroundColor: async () => {},
  },

  declarativeContent: undefined,
};

// Inject into globalThis so all imports that reference `chrome` get the stub
(globalThis as unknown as Record<string, unknown>).chrome = chromeMock;

export {};

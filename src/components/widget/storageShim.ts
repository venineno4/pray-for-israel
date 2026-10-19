/**
 * Side-effect module — MUST be imported before anything that loads the
 * Supabase client (see the first import in PrayerWidget.tsx).
 *
 * In a cross-site iframe with third-party storage blocked (e.g. Chrome
 * "Block third-party cookies"), merely reading `window.sessionStorage` /
 * `window.localStorage` throws a SecurityError. supabase-js's auth client
 * guards against this, but its realtime transport (phoenix Socket) reads
 * `global.sessionStorage` unguarded in its constructor, which would crash the
 * whole widget at module-evaluation time.
 *
 * If (and only if) a storage is inaccessible, we shadow it on `window` with an
 * in-memory Storage implementation. Normal browsers are left untouched.
 * This module is imported exclusively by the widget, never by the main site.
 */

function isAccessible(key: "localStorage" | "sessionStorage"): boolean {
  try {
    const s = window[key];
    const probe = "__pfw_probe__";
    s.setItem(probe, probe);
    s.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function createMemoryStorage(): Storage {
  let data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear() {
      data = new Map();
    },
    getItem(key: string) {
      return data.has(key) ? data.get(key)! : null;
    },
    key(index: number) {
      return Array.from(data.keys())[index] ?? null;
    },
    removeItem(key: string) {
      data.delete(key);
    },
    setItem(key: string, value: string) {
      data.set(key, String(value));
    },
  } as Storage;
}

if (typeof window !== "undefined") {
  (["sessionStorage", "localStorage"] as const).forEach((key) => {
    if (isAccessible(key)) return;
    const memory = createMemoryStorage();
    try {
      Object.defineProperty(window, key, { configurable: true, get: () => memory });
    } catch {
      /* non-configurable in this browser — safeStorage still falls back to memory */
    }
  });
}

export {};

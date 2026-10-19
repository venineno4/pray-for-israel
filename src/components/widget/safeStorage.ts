/**
 * Third-party-iframe-safe key/value storage for the embeddable widget.
 *
 * When /widget is embedded on another site (e.g. allisraelnews.com), browsers
 * may block or partition storage for the cross-site iframe:
 *  - Chrome with "Block third-party cookies" throws a SecurityError on ANY
 *    access to `window.localStorage` / `window.sessionStorage`.
 *  - Safari / Firefox partition storage per top-level site (works, but isolated).
 *
 * This helper tries localStorage → sessionStorage → in-memory Map, so the
 * prayer session logic never crashes and always has a stable user/session id
 * for the lifetime of the page (backend validation is token-based via the
 * `user_id` / `session_id` fields in the request body, never cookies).
 */

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const memory = new Map<string, string>();

const memoryStorage: StorageLike = {
  getItem: (k) => (memory.has(k) ? memory.get(k)! : null),
  setItem: (k, v) => {
    memory.set(k, String(v));
  },
  removeItem: (k) => {
    memory.delete(k);
  },
};

function probe(getter: () => Storage): StorageLike | null {
  try {
    const s = getter();
    if (!s) return null;
    const key = `__pfi_probe_${Math.random().toString(36).slice(2)}`;
    s.setItem(key, "1");
    s.removeItem(key);
    return s;
  } catch {
    return null;
  }
}

let resolved: StorageLike | null = null;
function getBackend(): StorageLike {
  if (resolved) return resolved;
  if (typeof window === "undefined") return memoryStorage;

  resolved =
    probe(() => window.localStorage) ||
    probe(() => window.sessionStorage) ||
    memoryStorage;
  return resolved;
}

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      return getBackend().getItem(key);
    } catch {
      return memoryStorage.getItem(key);
    }
  },
  setItem(key: string, value: string): void {
    try {
      getBackend().setItem(key, value);
    } catch {
      memoryStorage.setItem(key, value);
    }
  },
  removeItem(key: string): void {
    try {
      getBackend().removeItem(key);
    } catch {
      memoryStorage.removeItem(key);
    }
  },
};

export function randomId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

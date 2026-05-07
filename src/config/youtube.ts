export const YOUTUBE_API_BASE_URL = import.meta.env.VITE_YOUTUBE_API_BASE_URL as string;

// Support both VITE_YOUTUBE_API_KEYS (comma-separated) and legacy VITE_YOUTUBE_API_KEY
const rawKeys = (
  (import.meta.env.VITE_YOUTUBE_API_KEYS as string) ||
  (import.meta.env.VITE_YOUTUBE_API_KEY as string) ||
  ""
)
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

export const YOUTUBE_API_KEYS: string[] = rawKeys;

// Current key index — persisted in sessionStorage so it survives hot-reloads
// but resets each browser session (quota resets daily anyway)
const KEY_INDEX_STORAGE = "ado_yt_key_idx";

const getKeyIndex = (): number => {
  const stored = sessionStorage.getItem(KEY_INDEX_STORAGE);
  const idx = stored ? parseInt(stored, 10) : 0;
  return isNaN(idx) ? 0 : Math.min(idx, rawKeys.length - 1);
};

const setKeyIndex = (idx: number) => {
  sessionStorage.setItem(KEY_INDEX_STORAGE, String(idx));
};

/** Returns the currently active API key */
export const getActiveKey = (): string => {
  if (rawKeys.length === 0) return "";
  return rawKeys[getKeyIndex()];
};

/**
 * Called when the current key hits quota.
 * Rotates to the next key and returns it.
 * Returns null if all keys are exhausted.
 */
export const rotateKey = (): string | null => {
  const current = getKeyIndex();
  const next = current + 1;
  if (next >= rawKeys.length) {
    console.error(`[keyRotation] All ${rawKeys.length} API key(s) exhausted.`);
    return null;
  }
  console.warn(`[keyRotation] Key ${current + 1} quota exceeded → switching to key ${next + 1}`);
  setKeyIndex(next);
  return rawKeys[next];
};

/** How many keys are configured */
export const totalKeys = (): number => rawKeys.length;

const cache = new Map();
const MAX_ENTRIES = 500;

export function get(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt && entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

export function set(key, value, ttlMs = 5 * 60 * 1000) {
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export function del(key) {
  cache.delete(key);
}

export function flush(prefix) {
  if (prefix) {
    for (const key of cache.keys()) {
      if (key.startsWith(prefix)) cache.delete(key);
    }
  } else {
    cache.clear();
  }
}

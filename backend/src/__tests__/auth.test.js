import { describe, it, expect, afterAll, beforeEach } from 'vitest';

// ── C1: JWT secret validation ──────────────────────────────────────────

describe('getJwtSecret()', () => {
  const ORIGINAL = process.env.JWT_SECRET;

  afterAll(() => { process.env.JWT_SECRET = ORIGINAL; });
  beforeEach(() => { delete process.env.JWT_SECRET; });

  it('throws when JWT_SECRET is unset', async () => {
    const { getJwtSecret } = await import('../middleware/auth.js');
    expect(() => getJwtSecret()).toThrow(/JWT_SECRET is not set/);
  });

  it('throws when JWT_SECRET is "dev-secret"', async () => {
    process.env.JWT_SECRET = 'dev-secret';
    const { getJwtSecret } = await import('../middleware/auth.js');
    expect(() => getJwtSecret()).toThrow(/placeholder/);
  });

  it('throws when JWT_SECRET is "change-this-to-a-strong-secret"', async () => {
    process.env.JWT_SECRET = 'change-this-to-a-strong-secret';
    const { getJwtSecret } = await import('../middleware/auth.js');
    expect(() => getJwtSecret()).toThrow(/placeholder/);
  });

  it('returns the secret when it is strong', async () => {
    process.env.JWT_SECRET = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';
    const { getJwtSecret } = await import('../middleware/auth.js');
    expect(getJwtSecret()).toBe('a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2');
  });

  it('rejects empty string secret', async () => {
    process.env.JWT_SECRET = '';
    const { getJwtSecret } = await import('../middleware/auth.js');
    expect(() => getJwtSecret()).toThrow(/JWT_SECRET is not set/);
  });
});

// ── C4: Global error handlers ──────────────────────────────────────────

describe('Global error handlers', () => {
  it('registers unhandledRejection listener', () => {
    const listeners = process.listeners('unhandledRejection');
    expect(listeners.length).toBeGreaterThanOrEqual(1);
  });

  it('registers uncaughtException listener', () => {
    const listeners = process.listeners('uncaughtException');
    expect(listeners.length).toBeGreaterThanOrEqual(1);
  });
});

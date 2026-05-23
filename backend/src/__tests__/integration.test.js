import { describe, it, expect, beforeAll } from 'vitest';
import jwt from 'jsonwebtoken';
import supertest from 'supertest';

const JWT_SECRET = 'integration-test-secret';
let app, request;

beforeAll(async () => {
  process.env.JWT_SECRET = JWT_SECRET;
  process.env.NODE_ENV = 'test';
  // Force-load app with test env
  const appModule = await import('../app.js');
  app = appModule.default;
  request = supertest(app);
});

// ── C5: CORS behaviour ─────────────────────────────────────────────────

describe('CORS configuration', () => {
  it('sets Access-Control-Allow-Origin header', async () => {
    const res = await request.get('/api/health');
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });
});

// ── C2: Static file serving ────────────────────────────────────────────

describe('Static file serving for uploads', () => {
  it('responds with 404 on /uploads/nonexistent (route is mounted)', async () => {
    const res = await request.get('/uploads/nonexistent.png');
    expect(res.status).toBe(404);
  });
});

// ── C3: Feedback route auth guard ──────────────────────────────────────

describe('GET /api/feedback auth guard', () => {
  it('returns 401 without Authorization header', async () => {
    const res = await request.get('/api/feedback');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 403 with student token', async () => {
    const token = jwt.sign(
      { id: '000000000000000000000001', email: 'student@test.com', role: 'STUDENT' },
      JWT_SECRET
    );
    const res = await request
      .get('/api/feedback')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('returns 403 with coordinator token', async () => {
    const token = jwt.sign(
      { id: '000000000000000000000002', email: 'coord@test.com', role: 'COORDINATOR' },
      JWT_SECRET
    );
    const res = await request
      .get('/api/feedback')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('passes auth for admin token (returns 200 or hits controller)', async () => {
    const token = jwt.sign(
      { id: '000000000000000000000003', email: 'admin@test.com', role: 'ADMIN' },
      JWT_SECRET
    );
    const res = await request
      .get('/api/feedback')
      .set('Authorization', `Bearer ${token}`);
    // Should NOT get 401/403 — passes auth layer
    expect([200, 500]).toContain(res.status);
  });
});

// ── Health check (basic smoke test) ────────────────────────────────────

describe('GET /api/health', () => {
  it('returns status ok', async () => {
    const res = await request.get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('db');
    expect(res.body).toHaveProperty('timestamp');
  });
});

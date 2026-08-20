/**
 * Integration tests for the Converged Media Planning API.
 *
 * Uses Vitest + Supertest against the Express app created by createApp().
 * The store is re-seeded between tests via module re-import so each test
 * starts with a clean, predictable data set.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

// ── Helpers ──────────────────────────────────────────────────────────────────

const AUTH = 'Bearer demo-token';
const BAD_AUTH = 'Bearer wrong-token';

/**
 * Re-import the app factory and store fresh for every test so that mutations
 * (e.g. POST /v1/campaigns) don't bleed across tests.
 */
async function freshApp() {
  // Bust the module cache so the store re-seeds itself
  vi.resetModules();
  const { createApp } = await import('../src/app');
  return createApp();
}

// ── Health ────────────────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const app = await freshApp();
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
    expect(typeof res.body.timestamp).toBe('string');
  });
});

// ── Auth ──────────────────────────────────────────────────────────────────────

describe('Auth middleware', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const app = await freshApp();
    const res = await request(app).get('/v1/campaigns?advertiserId=adv_12345');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('returns 401 when bearer token is wrong', async () => {
    const app = await freshApp();
    const res = await request(app)
      .get('/v1/campaigns?advertiserId=adv_12345')
      .set('Authorization', BAD_AUTH);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });
});

// ── POST /v1/campaigns ────────────────────────────────────────────────────────

describe('POST /v1/campaigns', () => {
  it('creates a campaign and returns 201', async () => {
    const app = await freshApp();
    const payload = {
      advertiserId: 'adv_test',
      name: 'Test Campaign',
      budget: 50000,
    };

    const res = await request(app)
      .post('/v1/campaigns')
      .set('Authorization', AUTH)
      .set('Content-Type', 'application/json')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      advertiserId: 'adv_test',
      name: 'Test Campaign',
      budget: 50000,
      status: 'DRAFT',
    });
    expect(typeof res.body.data.id).toBe('string');
    expect(res.body.meta.message).toBe('Campaign created successfully.');
  });

  it('returns 400 when advertiserId is missing', async () => {
    const app = await freshApp();
    const res = await request(app)
      .post('/v1/campaigns')
      .set('Authorization', AUTH)
      .set('Content-Type', 'application/json')
      .send({ name: 'No Advertiser', budget: 1000 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Bad Request');
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.stringContaining('advertiserId'),
      ]),
    );
  });

  it('returns 400 when budget is missing', async () => {
    const app = await freshApp();
    const res = await request(app)
      .post('/v1/campaigns')
      .set('Authorization', AUTH)
      .set('Content-Type', 'application/json')
      .send({ advertiserId: 'adv_test', name: 'No Budget' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Bad Request');
    expect(res.body.details).toEqual(
      expect.arrayContaining([expect.stringContaining('budget')]),
    );
  });

  it('returns 400 when budget is zero or negative', async () => {
    const app = await freshApp();
    const res = await request(app)
      .post('/v1/campaigns')
      .set('Authorization', AUTH)
      .set('Content-Type', 'application/json')
      .send({ advertiserId: 'adv_test', name: 'Bad Budget', budget: -100 });

    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(
      expect.arrayContaining([expect.stringContaining('positive number')]),
    );
  });
});

// ── GET /v1/campaigns ─────────────────────────────────────────────────────────

describe('GET /v1/campaigns', () => {
  it('returns 200 and seeded campaigns for a known advertiserId', async () => {
    const app = await freshApp();
    const res = await request(app)
      .get('/v1/campaigns?advertiserId=adv_12345')
      .set('Authorization', AUTH);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.meta.advertiserId).toBe('adv_12345');
    // All returned campaigns belong to the requested advertiser
    for (const c of res.body.data) {
      expect(c.advertiserId).toBe('adv_12345');
    }
  });

  it('returns only ACTIVE campaigns when status=ACTIVE filter is applied', async () => {
    const app = await freshApp();
    const res = await request(app)
      .get('/v1/campaigns?advertiserId=adv_12345&status=ACTIVE')
      .set('Authorization', AUTH);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    for (const c of res.body.data) {
      expect(c.status).toBe('ACTIVE');
    }
    expect(res.body.meta.status).toBe('ACTIVE');
  });

  it('returns empty array for an advertiser with no campaigns', async () => {
    const app = await freshApp();
    const res = await request(app)
      .get('/v1/campaigns?advertiserId=adv_unknown')
      .set('Authorization', AUTH);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });

  it('returns 400 when advertiserId is missing', async () => {
    const app = await freshApp();
    const res = await request(app)
      .get('/v1/campaigns')
      .set('Authorization', AUTH);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Bad Request');
  });

  it('returns 400 for an invalid status value', async () => {
    const app = await freshApp();
    const res = await request(app)
      .get('/v1/campaigns?advertiserId=adv_12345&status=INVALID')
      .set('Authorization', AUTH);

    expect(res.status).toBe(400);
    expect(res.body.details).toEqual(
      expect.arrayContaining([expect.stringContaining('status')]),
    );
  });
});

// ── GET /v1/media-plans ───────────────────────────────────────────────────────

describe('GET /v1/media-plans', () => {
  it('returns 200 and the media plan for a known planId', async () => {
    const app = await freshApp();
    const res = await request(app)
      .get('/v1/media-plans?planId=plan_45678')
      .set('Authorization', AUTH);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('plan_45678');
    expect(res.body.meta.planId).toBe('plan_45678');
    expect(typeof res.body.meta.planningStatus).toBe('string');
  });

  it('returns 400 when planId query param is missing', async () => {
    const app = await freshApp();
    const res = await request(app)
      .get('/v1/media-plans')
      .set('Authorization', AUTH);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Bad Request');
    expect(res.body.message).toMatch(/planId/i);
  });

  it('returns 404 for an unknown planId', async () => {
    const app = await freshApp();
    const res = await request(app)
      .get('/v1/media-plans?planId=plan_does_not_exist')
      .set('Authorization', AUTH);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not Found');
  });
});

// ── 404 catch-all ─────────────────────────────────────────────────────────────

describe('Unknown routes', () => {
  it('returns 404 for an unregistered endpoint', async () => {
    const app = await freshApp();
    const res = await request(app).get('/v1/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not Found');
  });
});

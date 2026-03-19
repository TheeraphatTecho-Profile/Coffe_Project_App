import express from 'express';
import request from 'supertest';
import { healthRoutes } from '../routes/health.routes';

const app = express();
app.use('/api/health', healthRoutes);

describe('GET /api/health', () => {
  it('returns status ok with timestamp and uptime', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
    expect(typeof res.body.uptime).toBe('number');
  });

  it('returns valid ISO timestamp', async () => {
    const res = await request(app).get('/api/health');
    const parsed = new Date(res.body.timestamp);
    expect(parsed.toISOString()).toBe(res.body.timestamp);
  });
});

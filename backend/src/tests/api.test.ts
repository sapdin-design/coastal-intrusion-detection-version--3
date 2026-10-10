import request from 'supertest';
import app from '../app';
import { dbStore } from '../config/database';

describe('CIDRTM API Tests', () => {
  let authToken = '';

  beforeAll(async () => {
    dbStore.seed();
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'operator@cidrtm.gov.in', password: 'Operator@1234' });
    authToken = loginRes.body.data.token;
  });

  describe('GET /health', () => {
    it('should return 200 and healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.mode).toBe('SIMULATION MODE');
    });
  });

  describe('GET /api/vessels', () => {
    it('should return list of all seeded vessels', async () => {
      const res = await request(app).get('/api/vessels');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/zones', () => {
    it('should return list of all restricted zones', async () => {
      const res = await request(app).get('/api/zones');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/dashboard/stats', () => {
    it('should return dashboard operational metrics', async () => {
      const res = await request(app).get('/api/dashboard/stats');
      expect(res.status).toBe(200);
      expect(res.body.data.totalVessels).toBeDefined();
      expect(res.body.data.restrictedZones).toBeDefined();
    });
  });
});

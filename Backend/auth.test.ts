import request from 'supertest';
import app from '../src/index';
import { query } from '../src/config/database';

// These are integration tests — you need a test DB configured.
// Run with: DATABASE_URL=postgres://...test_db npm test

const testUser = {
  name: 'Test User',
  email: `test_${Date.now()}@example.com`,
  password: 'SecurePass123!',
};

describe('Auth API', () => {
  afterAll(async () => {
    await query('DELETE FROM users WHERE email = $1', [testUser.email]);
  });

  describe('POST /api/auth/register', () => {
    it('registers a new user and returns token', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('rejects duplicate email', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.status).toBe(409);
    });

    it('validates required fields', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'bad' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns token with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('rejects invalid password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'wrongpassword',
      });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns user profile with valid token', async () => {
      const loginRes = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      const token = loginRes.body.token as string;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('rejects unauthenticated requests', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});

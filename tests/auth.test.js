const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

beforeAll(async () => {
  // Clean up test users before running
  await prisma.user.deleteMany({ where: { email: { contains: '@test.com' } } });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { contains: '@test.com' } } });
  await prisma.$disconnect();
});

describe('Auth — Register', () => {
  it('should register a new user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'testuser@test.com',
      password: 'Test@1234',
      firstName: 'Test',
      lastName: 'User',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('testuser@test.com');
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should not register with duplicate email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'testuser@test.com',
      password: 'Test@1234',
      firstName: 'Test',
      lastName: 'User',
    });
    expect(res.statusCode).toBe(409);
  });

  it('should reject invalid email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'notanemail',
      password: 'Test@1234',
      firstName: 'Test',
      lastName: 'User',
    });
    expect(res.statusCode).toBe(422);
  });
});

describe('Auth — Login', () => {
  it('should login with correct credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'testuser@test.com',
      password: 'Test@1234',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should reject wrong password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'testuser@test.com',
      password: 'wrongpassword',
    });
    expect(res.statusCode).toBe(401);
  });
});

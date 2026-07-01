const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

let adminToken;
let locationId;
let vehicleId;

beforeAll(async () => {
  // Login as admin (seeded in prisma/seed.js)
  const res = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@carhire.com',
    password: 'Admin@1234',
  });
  adminToken = res.body.data?.accessToken;

  const location = await prisma.location.findFirst();
  locationId = location?.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Vehicles — Public', () => {
  it('should return vehicle list', async () => {
    const res = await request(app).get('/api/v1/vehicles');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('Vehicles — Admin', () => {
  it('should create a vehicle', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        make: 'Honda',
        model: 'Civic',
        year: 2022,
        licensePlate: 'TEST-001',
        pricePerDay: '50.00',
        locationId,
      });
    expect(res.statusCode).toBe(201);
    vehicleId = res.body.data?.id;
  });

  it('should not create vehicle without auth', async () => {
    const res = await request(app).post('/api/v1/vehicles').send({
      make: 'Honda', model: 'Civic', year: 2022,
      licensePlate: 'TEST-002', pricePerDay: '50.00', locationId,
    });
    expect(res.statusCode).toBe(401);
  });
});

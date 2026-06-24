# Car Hire Backend API

## Stack
- Node.js + Express
- PostgreSQL + Prisma ORM
- Redis (caching / queues)
- JWT Auth (access + refresh tokens)
- Stripe payments

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env and fill in values
cp .env.example .env

# 3. Start DB + Redis
docker-compose up postgres redis -d

# 4. Run migrations
npm run migrate

# 5. Seed sample data
npm run seed

# 6. Start dev server
npm run dev
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/auth/register | Register |
| POST | /api/v1/auth/login | Login |
| POST | /api/v1/auth/refresh-token | Refresh JWT |
| GET | /api/v1/vehicles | List/search vehicles |
| POST | /api/v1/bookings | Create booking |
| POST | /api/v1/payments/checkout/:bookingId | Stripe checkout |
| GET | /api/v1/admin/dashboard | Admin stats |

## Project Structure

```
src/
  config/       # DB, Redis, logger
  controllers/  # Route handlers
  middleware/   # Auth, validation, errors
  routes/       # Express routers
prisma/
  schema.prisma # DB schema
  seed.js       # Sample data
```

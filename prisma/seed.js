const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Admin user
  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@carhire.com' },
    update: {},
    create: {
      email: 'admin@carhire.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  // Sample location
  const location = await prisma.location.upsert({
    where: { id: 'loc-nairobi' },
    update: {},
    create: {
      id: 'loc-nairobi',
      name: 'Nairobi CBD',
      address: 'Kenyatta Avenue',
      city: 'Nairobi',
      country: 'Kenya',
      latitude: -1.286389,
      longitude: 36.817223,
    },
  });

  // Sample vehicles
  await prisma.vehicle.createMany({
    skipDuplicates: true,
    data: [
      {
        make: 'Toyota',
        model: 'Corolla',
        year: 2022,
        licensePlate: 'KBZ 001A',
        color: 'White',
        fuelType: 'PETROL',
        transmission: 'AUTOMATIC',
        pricePerDay: 45.00,
        locationId: location.id,
        features: ['AC', 'Bluetooth', 'USB'],
      },
      {
        make: 'Toyota',
        model: 'Land Cruiser',
        year: 2023,
        licensePlate: 'KBZ 002B',
        color: 'Black',
        fuelType: 'DIESEL',
        transmission: 'AUTOMATIC',
        pricePerDay: 120.00,
        seats: 7,
        locationId: location.id,
        features: ['AC', 'GPS', '4WD', 'Bluetooth'],
      },
      {
        make: 'Hyundai',
        model: 'Tucson',
        year: 2023,
        licensePlate: 'KBZ 003C',
        color: 'Silver',
        fuelType: 'PETROL',
        transmission: 'AUTOMATIC',
        pricePerDay: 65.00,
        locationId: location.id,
        features: ['AC', 'GPS', 'Bluetooth', 'Backup Camera'],
      },
    ],
  });

  console.log('Seed complete. Admin:', admin.email);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

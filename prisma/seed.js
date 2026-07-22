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

  // Fetch vehicles to get their IDs
  const vehicles = await prisma.vehicle.findMany();
  const corolla = vehicles.find((v) => v.model === 'Corolla');
  const landCruiser = vehicles.find((v) => v.model === 'Land Cruiser');
  const tucson = vehicles.find((v) => v.model === 'Tucson');

  // Add images to vehicles
  if (corolla && landCruiser && tucson) {
    await prisma.vehicleImage.createMany({
      skipDuplicates: true,
      data: [
        {
          vehicleId: corolla.id,
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2023_Toyota_Corolla_%28facelift%2C_sedan%29%2C_front_8.13.23.jpg/1280px-2023_Toyota_Corolla_%28facelift%2C_sedan%29%2C_front_8.13.23.jpg',
          isPrimary: true,
        },
        {
          vehicleId: landCruiser.id,
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/2022_Toyota_Land_Cruiser_%28300_Series%2C_GXR%29%2C_front_8.22.22.jpg/1280px-2022_Toyota_Land_Cruiser_%28300_Series%2C_GXR%29%2C_front_8.22.22.jpg',
          isPrimary: true,
        },
        {
          vehicleId: tucson.id,
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/2022_Hyundai_Tucson_%28NX4%29_Elite_2WD_%28facelift%29_wagon_%282022-10-19%29_01.jpg/1280px-2022_Hyundai_Tucson_%28NX4%29_Elite_2WD_%28facelift%29_wagon_%282022-10-19%29_01.jpg',
          isPrimary: true,
        },
      ],
    });
  }

  console.log('Seed complete. Admin:', admin.email);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

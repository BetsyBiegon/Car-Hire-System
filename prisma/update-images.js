require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vehicles = await prisma.vehicle.findMany();

  const imageMap = {
    'Corolla': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2023_Toyota_Corolla_%28facelift%2C_sedan%29%2C_front_8.13.23.jpg/1280px-2023_Toyota_Corolla_%28facelift%2C_sedan%29%2C_front_8.13.23.jpg',
    'Land Cruiser': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/2022_Toyota_Land_Cruiser_%28300_Series%2C_GXR%29%2C_front_8.22.22.jpg/1280px-2022_Toyota_Land_Cruiser_%28300_Series%2C_GXR%29%2C_front_8.22.22.jpg',
    'Tucson': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/2022_Hyundai_Tucson_%28NX4%29_Elite_2WD_%28facelift%29_wagon_%282022-10-19%29_01.jpg/1280px-2022_Hyundai_Tucson_%28NX4%29_Elite_2WD_%28facelift%29_wagon_%282022-10-19%29_01.jpg',
  };

  for (const vehicle of vehicles) {
    const url = imageMap[vehicle.model];
    if (!url) continue;

    // Delete old images and insert fresh ones
    await prisma.vehicleImage.deleteMany({ where: { vehicleId: vehicle.id } });
    await prisma.vehicleImage.create({
      data: { vehicleId: vehicle.id, url, isPrimary: true },
    });
    console.log(`Updated image for ${vehicle.make} ${vehicle.model}`);
  }

  console.log('Done.');
}

main().catch(console.error).finally(() => prisma.$disconnect());

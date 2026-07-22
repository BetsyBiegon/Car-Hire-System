require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vehicles = await prisma.vehicle.findMany();

  const imageMap = {
    'Corolla': 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop',
    'Land Cruiser': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop',
    'Tucson': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop',
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

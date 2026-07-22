require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const images = await prisma.vehicleImage.findMany();
  console.log(JSON.stringify(images, null, 2));
}

main().finally(() => prisma.$disconnect());

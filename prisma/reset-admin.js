require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Admin@1234', 12);
  await prisma.user.update({
    where: { email: 'admin@carhire.com' },
    data: { password: hash },
  });
  console.log('Admin password reset to: Admin@1234');
}

main().catch(console.error).finally(() => prisma.$disconnect());

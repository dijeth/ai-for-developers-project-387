import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(await prisma.timeOff.findMany())
}

main()
  .catch((e) => {
    console.error('❌ Error during script execution:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

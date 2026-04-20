import { PrismaClient } from '@prisma/client';
import { SeedService } from '../src/common/seed/seed.service';
import { PrismaService } from '../src/prisma/prisma.service';

const prismaClient = new PrismaClient();
// Create a PrismaService-like object that wraps the PrismaClient
const prismaService = prismaClient as unknown as PrismaService;
const seedService = new SeedService(prismaService);

async function main() {
  await seedService.seed();
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });

import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { PublicModule } from './public/public.module';
import { TestingModule } from './common/testing/testing.module';

@Module({
  imports: [
    PrismaModule,
    AdminModule,
    PublicModule,
    ...(process.env.E2E_TESTING === 'true' ? [TestingModule] : []),
  ],
})
export class AppModule {}

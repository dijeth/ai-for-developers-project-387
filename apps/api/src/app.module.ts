import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { PublicModule } from './public/public.module';

@Module({
  imports: [PrismaModule, AdminModule, PublicModule],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { SeedModule } from '../seed/seed.module';
import { TestingController } from './testing.controller';

@Module({
  imports: [SeedModule],
  controllers: [TestingController],
})
export class TestingModule {}

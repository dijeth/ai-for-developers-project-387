import { Controller, NotFoundException, Post } from '@nestjs/common';
import { SeedService } from '../seed/seed.service';

@Controller('api/testing')
export class TestingController {
  constructor(private readonly seedService: SeedService) {}

  @Post('reset')
  async reset(): Promise<{ ok: true; created: Record<string, number> }> {
    // Runtime guard: only available when E2E_TESTING is enabled
    if (process.env.E2E_TESTING !== 'true') {
      throw new NotFoundException();
    }

    const created = await this.seedService.seed();

    return { ok: true, created };
  }
}

import { Controller, Get } from '@nestjs/common';
import { PublicOwnerApiService } from '../services/public-owner-api.service';
import { PublicOwnerDto } from '../../dto/owner/public-owner.dto';

@Controller('api')
export class PublicOwnerController {
  constructor(private publicOwnerApiService: PublicOwnerApiService) {}

  @Get('owner')
  async getPublicOwner(): Promise<PublicOwnerDto> {
    return this.publicOwnerApiService.getPublicOwner();
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { OwnerService } from '../../prisma/models/owner.service';
import { PublicOwnerDto } from '../../dto/owner/public-owner.dto';

@Injectable()
export class PublicOwnerApiService {
  private readonly ownerId = 'owner';

  constructor(private ownerService: OwnerService) {}

  async getPublicOwner(): Promise<PublicOwnerDto> {
    const owner = await this.ownerService.findOne(this.ownerId);

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    return this.mapToPublicDto(owner);
  }

  private mapToPublicDto(owner: {
    name: string;
    description: string | null;
    avatar: string | null;
    bookingMonthsAhead: number;
    timezone: string;
  }): PublicOwnerDto {
    return {
      name: owner.name,
      description: owner.description ?? undefined,
      avatar: owner.avatar ?? undefined,
      bookingMonthsAhead: owner.bookingMonthsAhead,
      timezone: owner.timezone,
    };
  }
}


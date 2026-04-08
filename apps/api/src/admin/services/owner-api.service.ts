import { Injectable, NotFoundException } from '@nestjs/common';
import { OwnerService } from '../../prisma/models/owner.service';
import { UpdateOwnerDto } from '../../dto/owner/update-owner.dto';
import { OwnerDto } from '../../dto/owner/owner.dto';
import { DayOfWeek } from '../../common/enums/day-of-week.enum';

@Injectable()
export class OwnerApiService {
  constructor(private ownerService: OwnerService) {}

  async getOwner(ownerId: string): Promise<OwnerDto> {
    const owner = await this.ownerService.findOne(ownerId);

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    return this.mapToDto(owner);
  }

  async updateOwner(ownerId: string, dto: UpdateOwnerDto): Promise<OwnerDto> {
    const owner = await this.ownerService.findOne(ownerId);

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    const updated = await this.ownerService.update(ownerId, dto);
    return this.mapToDto(updated);
  }

  private mapToDto(owner: {
    name: string;
    email: string;
    description: string | null;
    avatar: string | null;
    bookingMonthsAhead: number;
    workingHoursStart: string;
    workingHoursEnd: string;
    workingDays: DayOfWeek[];
  }): OwnerDto {
    return {
      name: owner.name,
      email: owner.email,
      description: owner.description ?? undefined,
      avatar: owner.avatar ?? undefined,
      bookingMonthsAhead: owner.bookingMonthsAhead,
      workingHours: {
        startTime: owner.workingHoursStart,
        endTime: owner.workingHoursEnd,
        workingDays: owner.workingDays,
      },
    };
  }
}

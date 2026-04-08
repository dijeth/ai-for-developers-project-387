import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DayOfWeek } from '../../common/enums/day-of-week.enum';
import { UpdateOwnerDto } from '../../dto/owner/update-owner.dto';

@Injectable()
export class OwnerService {
  constructor(private prisma: PrismaService) {}

  async findOne(ownerId: string) {
    const owner = await this.prisma.owner.findUnique({
      where: { id: ownerId },
      include: {
        timeOffs: {
          orderBy: { startDateTime: 'asc' },
        },
      },
    });

    if (!owner) {
      return null;
    }

    // Parse workingDays JSON
    return {
      ...owner,
      workingDays: this.parseWorkingDays(owner.workingDays),
    };
  }

  async update(ownerId: string, data: UpdateOwnerDto) {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.bookingMonthsAhead !== undefined)
      updateData.bookingMonthsAhead = data.bookingMonthsAhead;

    if (data.workingHours) {
      if (data.workingHours.startTime !== undefined)
        updateData.workingHoursStart = data.workingHours.startTime;
      if (data.workingHours.endTime !== undefined)
        updateData.workingHoursEnd = data.workingHours.endTime;
      if (data.workingHours.workingDays !== undefined)
        updateData.workingDays = JSON.stringify(data.workingHours.workingDays);
    }

    const owner = await this.prisma.owner.update({
      where: { id: ownerId },
      data: updateData,
      include: {
        timeOffs: {
          orderBy: { startDateTime: 'asc' },
        },
      },
    });

    return {
      ...owner,
      workingDays: this.parseWorkingDays(owner.workingDays),
    };
  }

  private parseWorkingDays(workingDaysJson: string): DayOfWeek[] {
    try {
      return JSON.parse(workingDaysJson) as DayOfWeek[];
    } catch {
      return [];
    }
  }
}

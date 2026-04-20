import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateOwnerDto } from '../../dto/owner/update-owner.dto';

@Injectable()
export class OwnerService {
  constructor(private prisma: PrismaService) {}

  async findOne(ownerId: string) {
    return this.prisma.owner.findUnique({
      where: { id: ownerId },
    });
  }

  async update(ownerId: string, data: UpdateOwnerDto) {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.bookingMonthsAhead !== undefined)
      updateData.bookingMonthsAhead = data.bookingMonthsAhead;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;

    return this.prisma.owner.update({
      where: { id: ownerId },
      data: updateData,
    });
  }
}

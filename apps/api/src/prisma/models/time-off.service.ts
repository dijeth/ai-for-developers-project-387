import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTimeOffDto, UpdateTimeOffDto } from '../../dto/owner/time-off-request.dto';

@Injectable()
export class TimeOffService {
  constructor(private prisma: PrismaService) {}

  async findAll(ownerId: string) {
    return this.prisma.timeOff.findMany({
      where: { ownerId },
      orderBy: { startDateTime: 'asc' },
    });
  }

  async findOne(id: string, ownerId: string) {
    return this.prisma.timeOff.findFirst({
      where: { id, ownerId },
    });
  }

  async create(ownerId: string, data: CreateTimeOffDto) {
    return this.prisma.timeOff.create({
      data: {
        ownerId,
        startDateTime: new Date(data.startDateTime),
        endDateTime: new Date(data.endDateTime),
      },
    });
  }

  async update(id: string, ownerId: string, data: UpdateTimeOffDto) {
    const updateData: Record<string, Date> = {};

    if (data.startDateTime !== undefined) {
      updateData.startDateTime = new Date(data.startDateTime);
    }
    if (data.endDateTime !== undefined) {
      updateData.endDateTime = new Date(data.endDateTime);
    }

    return this.prisma.timeOff.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string, ownerId: string) {
    // Verify ownership before delete
    const timeOff = await this.findOne(id, ownerId);
    if (!timeOff) {
      return null;
    }

    return this.prisma.timeOff.delete({
      where: { id },
    });
  }
}

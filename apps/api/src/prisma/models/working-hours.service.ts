import { Injectable } from '@nestjs/common';
import { Weekday } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class WorkingHoursService {
  constructor(private prisma: PrismaService) {}

  async findByOwnerId(ownerId: string) {
    return this.prisma.workingHours.findMany({
      where: { ownerId },
      orderBy: { weekday: 'asc' },
    });
  }

  async findByWeekday(ownerId: string, weekday: Weekday) {
    return this.prisma.workingHours.findUnique({
      where: { weekday_ownerId: { weekday, ownerId } },
    });
  }

  async create(ownerId: string, data: { weekday: Weekday; startTime: string; endTime: string }) {
    return this.prisma.workingHours.create({
      data: { ...data, ownerId },
    });
  }

  async update(
    ownerId: string,
    weekday: Weekday,
    data: { startTime?: string; endTime?: string },
  ) {
    return this.prisma.workingHours.update({
      where: { weekday_ownerId: { weekday, ownerId } },
      data,
    });
  }

  async delete(ownerId: string, weekday: Weekday) {
    await this.prisma.workingHours.delete({
      where: { weekday_ownerId: { weekday, ownerId } },
    });
  }

  async replaceAll(
    ownerId: string,
    entries: { weekday: Weekday; startTime: string; endTime: string }[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.workingHours.deleteMany({ where: { ownerId } });
      if (entries.length > 0) {
        await tx.workingHours.createMany({
          data: entries.map((e) => ({ ...e, ownerId })),
        });
      }
      return tx.workingHours.findMany({
        where: { ownerId },
        orderBy: { weekday: 'asc' },
      });
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEventTypeDto, UpdateEventTypeDto } from '../../dto/event-type/event-type-request.dto';

@Injectable()
export class EventTypeService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.eventType.findMany({
      orderBy: { durationMinutes: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.eventType.findUnique({
      where: { id },
    });
  }

  async create(data: CreateEventTypeDto) {
    return this.prisma.eventType.create({
      data: {
        title: data.title,
        durationMinutes: data.durationMinutes,
        description: data.description,
      },
    });
  }

  async update(id: string, data: UpdateEventTypeDto) {
    const updateData: Record<string, string | number | null | undefined> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.durationMinutes !== undefined)
      updateData.durationMinutes = data.durationMinutes;
    if (data.description !== undefined)
      updateData.description = data.description;

    return this.prisma.eventType.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    return this.prisma.eventType.delete({
      where: { id },
    });
  }
}

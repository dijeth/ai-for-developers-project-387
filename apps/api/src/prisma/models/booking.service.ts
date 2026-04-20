import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface CreateBookingData {
  eventTypeId: string;
  startTime: Date;
  endTime: Date;
  guestName: string;
  guestEmail: string;
}

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.booking.findMany({
      orderBy: { startTime: 'asc' },
      include: {
        eventType: true,
      },
    });
  }

  async findByDateRange(dateFrom?: Date, dateTo?: Date) {
    const where: { startTime?: { gte?: Date; lte?: Date } } = {};
    
    if (dateFrom || dateTo) {
      where.startTime = {};
      if (dateFrom) {
        where.startTime.gte = dateFrom;
      }
      if (dateTo) {
        where.startTime.lte = dateTo;
      }
    }

    return this.prisma.booking.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { startTime: 'asc' },
      include: {
        eventType: true,
      },
    });
  }

  async findInRange(start: Date, end: Date) {
    return this.prisma.booking.findMany({
      where: {
        // Booking overlaps with range if:
        // booking.start < range.end AND booking.end > range.start
        AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
      },
      include: {
        eventType: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async create(data: CreateBookingData) {
    return this.prisma.booking.create({
      data: {
        eventTypeId: data.eventTypeId,
        startTime: data.startTime,
        endTime: data.endTime,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
      },
      include: {
        eventType: true,
      },
    });
  }

  /**
   * Check if there are NO bookings in the given date range.
   * Returns true if no bookings exist, false if at least one booking overlaps.
   */
  async checkNoBookingsInRange(start: Date, end: Date): Promise<boolean> {
    const count = await this.prisma.booking.count({
      where: {
        OR: [
          // Booking starts within the range
          { startTime: { gte: start, lt: end } },
          // Booking ends within the range
          { endTime: { gt: start, lte: end } },
          // Booking fully contains the range
          { AND: [{ startTime: { lte: start } }, { endTime: { gte: end } }] },
        ],
      },
    });

    return count === 0;
  }

  async hasBookingsForEventType(eventTypeId: string): Promise<boolean> {
    const count = await this.prisma.booking.count({
      where: { eventTypeId },
    });

    return count > 0;
  }

  async findById(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        eventType: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.booking.delete({
      where: { id },
      include: {
        eventType: true,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

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
}

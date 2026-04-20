import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SeedService {
  constructor(private readonly prisma: PrismaService) {}

  async seed(): Promise<{
    owner: number;
    workingHours: number;
    eventTypes: number;
    bookings: number;
    timeOffs: number;
  }> {
    console.log('🌱 Seeding database...\n');

    // Clean up existing data
    await this.prisma.booking.deleteMany();
    await this.prisma.timeOff.deleteMany();
    await this.prisma.workingHours.deleteMany();
    await this.prisma.eventType.deleteMany();
    await this.prisma.owner.deleteMany();

    console.log('✅ Cleaned up existing data');

    // ============================================================================
    // 1. Create Owner (singleton - владелец календаря)
    // ============================================================================
    const owner = await this.prisma.owner.create({
      data: {
        id: 'owner',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@example.com',
        description:
          'Senior Software Architect & Tech Lead with 10+ years of experience in building scalable systems. Available for architecture reviews, code reviews, and mentorship sessions.',
        avatar: 'https://i.pravatar.cc/150?img=3',
        bookingMonthsAhead: 3,
        timezone: 'Europe/Moscow',
      },
    });

    console.log(`✅ Created Owner: ${owner.name} (${owner.email})`);

    // ============================================================================
    // 1.5 Create WorkingHours (mon-fri, 09:00-17:00)
    // ============================================================================
    const workingHoursData: Prisma.WorkingHoursCreateManyInput[] = [
      { weekday: 'mon', startTime: '09:00', endTime: '17:00', ownerId: 'owner' },
      { weekday: 'tue', startTime: '09:00', endTime: '17:00', ownerId: 'owner' },
      { weekday: 'wed', startTime: '09:00', endTime: '17:00', ownerId: 'owner' },
      { weekday: 'thu', startTime: '09:00', endTime: '17:00', ownerId: 'owner' },
      { weekday: 'fri', startTime: '09:00', endTime: '17:00', ownerId: 'owner' },
    ];

    await this.prisma.workingHours.createMany({
      data: workingHoursData,
    });

    console.log('✅ Created 5 WorkingHours entries (mon-fri)');

    // ============================================================================
    // 2. Create EventTypes (типы событий/встреч)
    // ============================================================================
    const eventTypes = await this.prisma.eventType.createMany({
      data: [
        {
          id: 'et_quick_consult',
          title: 'Quick Consultation',
          durationMinutes: 15,
          description: 'Короткая консультация по любому вопросу (15 минут).',
        },
        {
          id: 'et_code_review',
          title: 'Code Review Session',
          durationMinutes: 30,
          description: 'Совместный разбор кода и рекомендации по улучшению.',
        },
        {
          id: 'et_architecture',
          title: 'Architecture Discussion',
          durationMinutes: 60,
          description: '', // пустое описание для проверки опциональности
        },
        {
          id: 'et_deep_dive',
          title: 'Deep Dive / Workshop',
          durationMinutes: 120,
          // description не задано, будет undefined
        },
      ],
    });

    console.log(`✅ Created ${eventTypes.count} Event Types`);

    // ============================================================================
    // 3. Prepare anchor dates for generated data
    // ============================================================================
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);

    // ============================================================================
    // 4. Create Bookings (бронирования)
    // ============================================================================
    const eventTypeMap = {
      et_quick_consult: 15,
      et_code_review: 30,
      et_architecture: 60,
      et_deep_dive: 120,
    };

    // Helper: find next weekday (1=Mon ... 5=Fri) at or after a given date
    const nextWeekday = (from: Date, weekday: number): Date => {
      const d = new Date(from);
      const day = d.getUTCDay() === 0 ? 7 : d.getUTCDay(); // 1=Mon, 7=Sun
      const diff = ((weekday - day) + 7) % 7;
      d.setUTCDate(d.getUTCDate() + diff);
      return d;
    };

    // Helper: date at specific UTC hour (returns new Date)
    const atHour = (date: Date, hour: number, minute = 0): Date => {
      const d = new Date(date);
      d.setUTCHours(hour, minute, 0, 0);
      return d;
    };

    // Anchor mondays of upcoming weeks (working days only, 09:00–17:00 UTC)
    const mon1 = nextWeekday(tomorrow, 1); // next Monday
    const tue1 = nextWeekday(tomorrow, 2); // next Tuesday
    const wed1 = nextWeekday(tomorrow, 3); // next Wednesday
    const thu1 = nextWeekday(tomorrow, 4); // next Thursday
    const fri1 = nextWeekday(tomorrow, 5); // next Friday

    const mon2 = new Date(mon1);
    mon2.setUTCDate(mon2.getUTCDate() + 7); // Monday +1 week
    const tue2 = new Date(tue1);
    tue2.setUTCDate(tue2.getUTCDate() + 7); // Tuesday +1 week
    const wed2 = new Date(wed1);
    wed2.setUTCDate(wed2.getUTCDate() + 7); // Wednesday +1 week

    const bookingsData = [
      // This week Monday - Code Review 10:00
      {
        eventTypeId: 'et_code_review',
        guestName: 'Alex Chen',
        guestEmail: 'alex.chen@techcompany.com',
        startTime: atHour(mon1, 10),
      },
      // This week Monday - Architecture Discussion 14:00
      {
        eventTypeId: 'et_architecture',
        guestName: 'Maria Garcia',
        guestEmail: 'maria.garcia@startup.io',
        startTime: atHour(mon1, 14),
      },
      // This week Tuesday - Quick Consult 09:30
      {
        eventTypeId: 'et_quick_consult',
        guestName: 'James Wilson',
        guestEmail: 'james.w@freelancer.net',
        startTime: atHour(tue1, 9, 30),
      },
      // This week Wednesday - Deep Dive 09:00
      {
        eventTypeId: 'et_deep_dive',
        guestName: 'Emma Thompson',
        guestEmail: 'emma.t@enterprise.com',
        startTime: atHour(wed1, 9),
      },
      // This week Thursday - Code Review 11:00
      {
        eventTypeId: 'et_code_review',
        guestName: 'David Kim',
        guestEmail: 'david.kim@devteam.org',
        startTime: atHour(thu1, 11),
      },
      // This week Friday - Architecture 15:00
      {
        eventTypeId: 'et_architecture',
        guestName: 'Sophie Martin',
        guestEmail: 'sophie.martin@design.co',
        startTime: atHour(fri1, 15),
      },
      // Next week Monday (before time-off) - Quick Consult 16:30
      {
        eventTypeId: 'et_quick_consult',
        guestName: 'Robert Brown',
        guestEmail: 'robert.brown@consulting.com',
        startTime: atHour(mon2, 16, 30),
      },
      // Next week Tuesday - Code Review 10:00
      {
        eventTypeId: 'et_code_review',
        guestName: 'Lisa Anderson',
        guestEmail: 'lisa.anderson@product.io',
        startTime: atHour(tue2, 10),
      },
      // Next week Wednesday - Architecture 13:00
      {
        eventTypeId: 'et_architecture',
        guestName: 'Noah Patel',
        guestEmail: 'noah.patel@labs.io',
        startTime: atHour(wed2, 13),
      },
    ];

    for (const bookingData of bookingsData) {
      const duration =
        eventTypeMap[bookingData.eventTypeId as keyof typeof eventTypeMap];
      const endTime = new Date(bookingData.startTime.getTime() + duration * 60 * 1000);

      await this.prisma.booking.create({
        data: {
          ...bookingData,
          endTime,
        },
      });
    }

    console.log(
      `✅ Created ${bookingsData.length} Bookings (all within working hours mon-fri 09:00-17:00 UTC)`,
    );

    // ============================================================================
    // 5. Create TimeOffs between bookings (no overlaps)
    // ============================================================================
    const bookingsWithEnd = bookingsData
      .map((bookingData) => {
        const duration =
          eventTypeMap[bookingData.eventTypeId as keyof typeof eventTypeMap];
        return {
          start: bookingData.startTime,
          end: new Date(bookingData.startTime.getTime() + duration * 60 * 1000),
        };
      })
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    const weekdayToWorkingWindow = new Map(
      workingHoursData.map((wh) => [wh.weekday, wh]),
    );
    const dayKeys = Array.from(
      new Set(bookingsWithEnd.map((b) => b.start.toISOString().slice(0, 10))),
    );

    const getWeekday = (date: Date): Prisma.WorkingHoursCreateManyInput['weekday'] => {
      const days: Prisma.WorkingHoursCreateManyInput['weekday'][] = [
        'sun',
        'mon',
        'tue',
        'wed',
        'thu',
        'fri',
        'sat',
      ];
      return days[date.getUTCDay()];
    };

    const atDayTimeUtc = (dateKey: string, time: string): Date => {
      return new Date(`${dateKey}T${time}:00.000Z`);
    };

    const candidateTimeOffs: Array<{ startDateTime: Date; endDateTime: Date; ownerId: string }> =
      [];
    const timeOffDurationMs = 45 * 60 * 1000;

    for (const dayKey of dayKeys) {
      if (candidateTimeOffs.length >= 3) {
        break;
      }

      const dayDate = new Date(`${dayKey}T00:00:00.000Z`);
      const weekday = getWeekday(dayDate);
      const workingHours = weekdayToWorkingWindow.get(weekday);

      if (!workingHours) {
        continue;
      }

      const dayBookings = bookingsWithEnd
        .filter((b) => b.start.toISOString().slice(0, 10) === dayKey)
        .sort((a, b) => a.start.getTime() - b.start.getTime());

      const workStart = atDayTimeUtc(dayKey, workingHours.startTime);
      const workEnd = atDayTimeUtc(dayKey, workingHours.endTime);

      const gaps: Array<{ start: Date; end: Date }> = [];
      let cursor = new Date(workStart);

      for (const booking of dayBookings) {
        if (booking.start > cursor) {
          gaps.push({ start: new Date(cursor), end: new Date(booking.start) });
        }

        if (booking.end > cursor) {
          cursor = new Date(booking.end);
        }
      }

      if (cursor < workEnd) {
        gaps.push({ start: new Date(cursor), end: new Date(workEnd) });
      }

      for (const gap of gaps) {
        if (candidateTimeOffs.length >= 3) {
          break;
        }

        if (gap.end.getTime() - gap.start.getTime() < timeOffDurationMs) {
          continue;
        }

        const startDateTime = new Date(gap.start);
        const endDateTime = new Date(startDateTime.getTime() + timeOffDurationMs);

        candidateTimeOffs.push({
          startDateTime,
          endDateTime,
          ownerId: 'owner',
        });
      }
    }

    const hasBookingOverlap = (start: Date, end: Date): boolean => {
      return bookingsWithEnd.some((booking) => booking.start < end && booking.end > start);
    };

    for (const timeOff of candidateTimeOffs) {
      if (hasBookingOverlap(timeOff.startDateTime, timeOff.endDateTime)) {
        throw new Error('Invalid seed data: generated time-off overlaps with booking');
      }
    }

    if (candidateTimeOffs.length === 0) {
      throw new Error('Invalid seed data: could not generate time-offs from booking gaps');
    }

    await this.prisma.timeOff.createMany({
      data: candidateTimeOffs,
    });

    console.log(
      `✅ Created ${candidateTimeOffs.length} Time Off entries (no booking overlaps)\n`,
    );

    // ============================================================================
    // Summary
    // ============================================================================
    console.log('🎉 Database seeded successfully!\n');
    console.log('Summary:');
    console.log(`  👤 Owner: ${owner.name}`);
    console.log(`  🕐 Working Hours: 5 days (mon-fri)`);
    console.log(`  📅 Event Types: ${eventTypes.count}`);
    console.log(`  🏖️  Time Offs: ${candidateTimeOffs.length}`);
    console.log(`  📋 Bookings: ${bookingsData.length}`);

    return {
      owner: 1,
      workingHours: 5,
      eventTypes: eventTypes.count,
      bookings: bookingsData.length,
      timeOffs: candidateTimeOffs.length,
    };
  }
}

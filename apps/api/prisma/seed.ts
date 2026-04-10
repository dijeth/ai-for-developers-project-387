import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clean up existing data
  await prisma.booking.deleteMany();
  await prisma.timeOff.deleteMany();
  await prisma.workingHours.deleteMany();
  await prisma.eventType.deleteMany();
  await prisma.owner.deleteMany();

  console.log('✅ Cleaned up existing data');

  // ============================================================================
  // 1. Create Owner (singleton - владелец календаря)
  // ============================================================================
  const owner = await prisma.owner.create({
    data: {
      id: 'owner',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@example.com',
      description: 'Senior Software Architect & Tech Lead with 10+ years of experience in building scalable systems. Available for architecture reviews, code reviews, and mentorship sessions.',
      avatar: 'https://i.pravatar.cc/150?img=5',
      bookingMonthsAhead: 3,
      timezone: 'Europe/Moscow',
    },
  });

  console.log(`✅ Created Owner: ${owner.name} (${owner.email})`);

  // ============================================================================
  // 1.5 Create WorkingHours (mon-fri, 09:00-17:00)
  // ============================================================================
  await prisma.workingHours.createMany({
    data: [
      { weekday: 'mon', startTime: '09:00', endTime: '17:00', ownerId: 'owner' },
      { weekday: 'tue', startTime: '09:00', endTime: '17:00', ownerId: 'owner' },
      { weekday: 'wed', startTime: '09:00', endTime: '17:00', ownerId: 'owner' },
      { weekday: 'thu', startTime: '09:00', endTime: '17:00', ownerId: 'owner' },
      { weekday: 'fri', startTime: '09:00', endTime: '17:00', ownerId: 'owner' },
    ],
  });

  console.log('✅ Created 5 WorkingHours entries (mon-fri)');

  // ============================================================================
  // 2. Create EventTypes (типы событий/встреч)
  // ============================================================================
  const eventTypes = await prisma.eventType.createMany({
    data: [
      {
        id: 'et_quick_consult',
        title: 'Quick Consultation',
        durationMinutes: 15,
      },
      {
        id: 'et_code_review',
        title: 'Code Review Session',
        durationMinutes: 30,
      },
      {
        id: 'et_architecture',
        title: 'Architecture Discussion',
        durationMinutes: 60,
      },
      {
        id: 'et_deep_dive',
        title: 'Deep Dive / Workshop',
        durationMinutes: 120,
      },
    ],
  });

  console.log(`✅ Created ${eventTypes.count} Event Types`);

  // ============================================================================
  // 3. Create TimeOffs (выходные и отпуска)
  // ============================================================================
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Создаем выходные на будущие даты
  const timeOffsData = [
    // Отпуск через 2 недели (недельный отпуск)
    {
      startDateTime: new Date(tomorrow.getTime() + 14 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(tomorrow.getTime() + 21 * 24 * 60 * 60 * 1000),
    },
    // Выходной через 4 недели (один день)
    {
      startDateTime: new Date(tomorrow.getTime() + 28 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(tomorrow.getTime() + 29 * 24 * 60 * 60 * 1000),
    },
    // Короткий выходной через 6 недель (утро)
    {
      startDateTime: new Date(tomorrow.getTime() + 42 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(tomorrow.getTime() + 42 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // +4 часа
    },
  ];

  for (const timeOffData of timeOffsData) {
    await prisma.timeOff.create({
      data: {
        ...timeOffData,
        ownerId: 'owner',
      },
    });
  }

  console.log(`✅ Created ${timeOffsData.length} Time Off entries`);

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
  const mon1 = nextWeekday(tomorrow, 1);          // next Monday
  const tue1 = nextWeekday(tomorrow, 2);          // next Tuesday
  const wed1 = nextWeekday(tomorrow, 3);          // next Wednesday
  const thu1 = nextWeekday(tomorrow, 4);          // next Thursday
  const fri1 = nextWeekday(tomorrow, 5);          // next Friday

  const mon2 = new Date(mon1); mon2.setUTCDate(mon2.getUTCDate() + 7);  // Monday +1 week
  const tue2 = new Date(tue1); tue2.setUTCDate(tue2.getUTCDate() + 7);  // Tuesday +1 week
  const wed2 = new Date(wed1); wed2.setUTCDate(wed2.getUTCDate() + 7);  // Wednesday +1 week

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
    const duration = eventTypeMap[bookingData.eventTypeId as keyof typeof eventTypeMap];
    const endTime = new Date(bookingData.startTime.getTime() + duration * 60 * 1000);

    await prisma.booking.create({
      data: {
        ...bookingData,
        endTime,
      },
    });
  }

  console.log(`✅ Created ${bookingsData.length} Bookings (all within working hours mon-fri 09:00-17:00 UTC)\n`);

  // ============================================================================
  // Summary
  // ============================================================================
  console.log('🎉 Database seeded successfully!\n');
  console.log('Summary:');
  console.log(`  👤 Owner: ${owner.name}`);
  console.log(`  � Working Hours: 5 days (mon-fri)`);
  console.log(`  �📅 Event Types: ${eventTypes.count}`);
  console.log(`  🏖️  Time Offs: ${timeOffsData.length}`);
  console.log(`  📋 Bookings: ${bookingsData.length}`);
  console.log('\n📌 Prisma Studio: npm run db:studio (opens at http://localhost:5555)');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

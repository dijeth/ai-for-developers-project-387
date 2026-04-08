import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clean up existing data
  await prisma.booking.deleteMany();
  await prisma.timeOff.deleteMany();
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
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      workingDays: JSON.stringify(['mon', 'tue', 'wed', 'thu', 'fri']),
    },
  });

  console.log(`✅ Created Owner: ${owner.name} (${owner.email})`);

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

  const bookingsData = [
    // Бронирование на завтра - Code Review
    {
      eventTypeId: 'et_code_review',
      guestName: 'Alex Chen',
      guestEmail: 'alex.chen@techcompany.com',
      startTime: new Date(tomorrow.getTime() + 10 * 60 * 60 * 1000), // 10:00 UTC
    },
    // Бронирование на завтра - Architecture Discussion
    {
      eventTypeId: 'et_architecture',
      guestName: 'Maria Garcia',
      guestEmail: 'maria.garcia@startup.io',
      startTime: new Date(tomorrow.getTime() + 13 * 60 * 60 * 1000), // 13:00 UTC
    },
    // Бронирование на послезавтра - Quick Consult
    {
      eventTypeId: 'et_quick_consult',
      guestName: 'James Wilson',
      guestEmail: 'james.w@freelancer.net',
      startTime: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000 + 9.5 * 60 * 60 * 1000), // 9:30 UTC
    },
    // Бронирование на следующую неделю - Deep Dive
    {
      eventTypeId: 'et_deep_dive',
      guestName: 'Emma Thompson',
      guestEmail: 'emma.t@enterprise.com',
      startTime: new Date(tomorrow.getTime() + 7 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // 14:00 UTC
    },
    // Бронирование на следующую неделю - Code Review
    {
      eventTypeId: 'et_code_review',
      guestName: 'David Kim',
      guestEmail: 'david.kim@devteam.org',
      startTime: new Date(tomorrow.getTime() + 8 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000), // 11:00 UTC
    },
    // Бронирование на следующую неделю - Architecture
    {
      eventTypeId: 'et_architecture',
      guestName: 'Sophie Martin',
      guestEmail: 'sophie.martin@design.co',
      startTime: new Date(tomorrow.getTime() + 9 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000), // 15:00 UTC
    },
    // Бронирование через 2 недели (перед отпуском) - Quick Consult
    {
      eventTypeId: 'et_quick_consult',
      guestName: 'Robert Brown',
      guestEmail: 'robert.brown@consulting.com',
      startTime: new Date(tomorrow.getTime() + 13 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // 16:00 UTC
    },
    // Бронирование через 3 недели (после отпуска) - Code Review
    {
      eventTypeId: 'et_code_review',
      guestName: 'Lisa Anderson',
      guestEmail: 'lisa.anderson@product.io',
      startTime: new Date(tomorrow.getTime() + 22 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // 10:00 UTC
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

  console.log(`✅ Created ${bookingsData.length} Bookings\n`);

  // ============================================================================
  // Summary
  // ============================================================================
  console.log('🎉 Database seeded successfully!\n');
  console.log('Summary:');
  console.log(`  👤 Owner: ${owner.name}`);
  console.log(`  📅 Event Types: ${eventTypes.count}`);
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

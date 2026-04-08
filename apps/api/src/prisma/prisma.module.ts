import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { OwnerService } from './models/owner.service';
import { TimeOffService } from './models/time-off.service';
import { BookingService } from './models/booking.service';
import { EventTypeService } from './models/event-type.service';

@Global()
@Module({
  providers: [
    PrismaService,
    OwnerService,
    TimeOffService,
    BookingService,
    EventTypeService,
  ],
  exports: [
    PrismaService,
    OwnerService,
    TimeOffService,
    BookingService,
    EventTypeService,
  ],
})
export class PrismaModule {}

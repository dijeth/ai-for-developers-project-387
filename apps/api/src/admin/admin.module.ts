import { Module } from '@nestjs/common';
import { AdminOwnerController } from './controllers/admin-owner.controller';
import { AdminEventTypesController } from './controllers/admin-event-types.controller';
import { AdminBookingsController } from './controllers/admin-bookings.controller';
import { AdminWorkingHoursController } from './controllers/admin-working-hours.controller';
import { OwnerApiService } from './services/owner-api.service';
import { TimeOffApiService } from './services/time-off-api.service';
import { EventTypeApiService } from './services/event-type-api.service';
import { BookingApiService } from './services/booking-api.service';
import { WorkingHoursApiService } from './services/working-hours-api.service';
import { TimezoneConverterService } from './services/timezone-converter.service';

@Module({
  controllers: [
    AdminOwnerController,
    AdminEventTypesController,
    AdminBookingsController,
    AdminWorkingHoursController,
  ],
  providers: [
    OwnerApiService,
    TimeOffApiService,
    EventTypeApiService,
    BookingApiService,
    WorkingHoursApiService,
    TimezoneConverterService,
  ],
})
export class AdminModule {}


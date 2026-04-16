import { Module } from '@nestjs/common';
import { PublicOwnerController } from './controllers/public-owner.controller';
import { PublicEventTypesController } from './controllers/public-event-types.controller';
import { PublicSlotsController } from './controllers/public-slots.controller';
import { PublicBookingsController } from './controllers/public-bookings.controller';
import { HealthController } from '../common/controllers/health.controller';
import { PublicOwnerApiService } from './services/public-owner-api.service';
import { PublicEventTypeApiService } from './services/public-event-type-api.service';
import { AvailableSlotsService } from './services/available-slots.service';
import { PublicBookingApiService } from './services/public-booking-api.service';

@Module({
  controllers: [
    PublicOwnerController,
    PublicEventTypesController,
    PublicSlotsController,
    PublicBookingsController,
    HealthController,
  ],
  providers: [
    PublicOwnerApiService,
    PublicEventTypeApiService,
    AvailableSlotsService,
    PublicBookingApiService,
  ],
})
export class PublicModule {}

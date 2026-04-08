import { Controller, Get } from '@nestjs/common';
import { BookingApiService } from '../services/booking-api.service';
import { BookingListResponseDto } from '../../dto/booking/booking.dto';

@Controller('api/admin')
export class AdminBookingsController {
  constructor(private bookingApiService: BookingApiService) {}

  @Get('bookings')
  async listBookings(): Promise<BookingListResponseDto> {
    return this.bookingApiService.listBookings();
  }
}

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PublicBookingApiService } from '../services/public-booking-api.service';
import { CreateBookingDto } from '../../dto/booking/create-booking.dto';
import { BookingDto } from '../../dto/booking/booking.dto';

@Controller('api')
export class PublicBookingsController {
  constructor(private publicBookingApiService: PublicBookingApiService) {}

  @Post('bookings')
  @HttpCode(HttpStatus.CREATED)
  async createBooking(@Body() dto: CreateBookingDto): Promise<BookingDto> {
    return this.publicBookingApiService.createBooking(dto);
  }
}

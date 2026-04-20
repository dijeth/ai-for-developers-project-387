import { Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Query } from '@nestjs/common';
import { BookingApiService } from '../services/booking-api.service';
import { BookingListResponseDto } from '../../dto/booking/booking.dto';

interface ListBookingsQuery {
  dateFrom?: string;
  dateTo?: string;
}

@Controller('api/admin')
export class AdminBookingsController {
  constructor(private bookingApiService: BookingApiService) {}

  @Get('bookings')
  async listBookings(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<BookingListResponseDto> {
    const filter: { dateFrom?: Date; dateTo?: Date } = {};
    
    if (dateFrom) {
      filter.dateFrom = new Date(dateFrom);
    }
    if (dateTo) {
      filter.dateTo = new Date(dateTo);
    }

    return this.bookingApiService.listBookings(
      Object.keys(filter).length > 0 ? filter : undefined
    );
  }

  @Delete('bookings/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBooking(@Param('id') id: string): Promise<void> {
    await this.bookingApiService.deleteBooking(id);
  }
}

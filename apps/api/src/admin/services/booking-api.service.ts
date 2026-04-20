import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingService } from '../../prisma/models/booking.service';
import { BookingDto, BookingListResponseDto } from '../../dto/booking/booking.dto';

interface ListBookingsFilter {
  dateFrom?: Date;
  dateTo?: Date;
}

@Injectable()
export class BookingApiService {
  constructor(private bookingService: BookingService) {}

  async listBookings(filter?: ListBookingsFilter): Promise<BookingListResponseDto> {
    let bookings;
    
    if (filter?.dateFrom || filter?.dateTo) {
      bookings = await this.bookingService.findByDateRange(filter.dateFrom, filter.dateTo);
    } else {
      bookings = await this.bookingService.findAll();
    }

    return {
      bookings: bookings.map((b) => this.mapToDto(b)),
    };
  }

  async deleteBooking(id: string): Promise<void> {
    const booking = await this.bookingService.findById(id);
    if (!booking) {
      throw new NotFoundException(`Booking with id ${id} not found`);
    }
    await this.bookingService.delete(id);
  }

  private mapToDto(booking: {
    id: string;
    startTime: Date;
    endTime: Date;
    guestName: string;
    guestEmail: string;
    eventType: {
      id: string;
      title: string;
      durationMinutes: number;
    };
  }): BookingDto {
    return {
      id: booking.id,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
      guest: {
        name: booking.guestName,
        email: booking.guestEmail,
      },
      eventType: {
        id: booking.eventType.id,
        title: booking.eventType.title,
        durationMinutes: booking.eventType.durationMinutes,
      },
    };
  }
}

import { Injectable } from '@nestjs/common';
import { BookingService } from '../../prisma/models/booking.service';
import { BookingDto, BookingListResponseDto } from '../../dto/booking/booking.dto';

@Injectable()
export class BookingApiService {
  constructor(private bookingService: BookingService) {}

  async listBookings(): Promise<BookingListResponseDto> {
    const bookings = await this.bookingService.findAll();

    return {
      bookings: bookings.map((b) => this.mapToDto(b)),
    };
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
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      eventType: {
        id: booking.eventType.id,
        title: booking.eventType.title,
        durationMinutes: booking.eventType.durationMinutes,
      },
    };
  }
}

import { AvailableSlotsService } from '../services/available-slots.service';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetAvailableSlotsDto } from '../../dto/slot/get-available-slots.dto';
import { AvailableSlotsResponseDto } from '../../dto/slot/available-slots-response.dto';

@Controller('api')
export class PublicSlotsController {
  constructor(private availableSlotsService: AvailableSlotsService) {}

  @Get('event-types/:id/available-slots')
  async getAvailableSlots(
    @Param('id') id: string,
    @Query() query: GetAvailableSlotsDto,
  ): Promise<AvailableSlotsResponseDto> {
    const slots = await this.availableSlotsService.getAvailableSlots(
      id,
      query.dateFrom,
      query.dateTo,
    );
    return { slots };
  }
}

import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AvailableSlotDto } from './available-slot.dto';

export class AvailableSlotsResponseDto {
  @ValidateNested({ each: true })
  @Type(() => AvailableSlotDto)
  slots!: AvailableSlotDto[];
}

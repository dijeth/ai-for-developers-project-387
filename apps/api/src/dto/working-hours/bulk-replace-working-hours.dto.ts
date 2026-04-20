import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateWorkingHoursDto } from './create-working-hours.dto';

export class BulkReplaceWorkingHoursDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkingHoursDto)
  workingHours!: CreateWorkingHoursDto[];
}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkingHoursApiService } from '../services/working-hours-api.service';
import { CreateWorkingHoursDto } from '../../dto/working-hours/create-working-hours.dto';
import { UpdateWorkingHoursDto } from '../../dto/working-hours/update-working-hours.dto';
import { WorkingHoursDto } from '../../dto/working-hours/working-hours.dto';
import { WorkingHoursListResponseDto } from '../../dto/working-hours/working-hours-list-response.dto';
import { DayOfWeek } from '../../common/enums/day-of-week.enum';

@Controller('api/admin/owner/working-hours')
export class AdminWorkingHoursController {
  private readonly ownerId = 'owner';

  constructor(private workingHoursApiService: WorkingHoursApiService) {}

  @Get()
  async listWorkingHours(): Promise<WorkingHoursListResponseDto> {
    const workingHours = await this.workingHoursApiService.listWorkingHours(this.ownerId);
    return { workingHours };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWorkingHours(@Body() dto: CreateWorkingHoursDto): Promise<WorkingHoursDto> {
    return this.workingHoursApiService.createWorkingHours(this.ownerId, dto);
  }

  @Put(':weekday')
  async updateWorkingHours(
    @Param('weekday') weekday: DayOfWeek,
    @Body() dto: UpdateWorkingHoursDto,
  ): Promise<WorkingHoursDto> {
    return this.workingHoursApiService.updateWorkingHours(this.ownerId, weekday, dto);
  }

  @Delete(':weekday')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteWorkingHours(@Param('weekday') weekday: DayOfWeek): Promise<void> {
    return this.workingHoursApiService.deleteWorkingHours(this.ownerId, weekday);
  }
}

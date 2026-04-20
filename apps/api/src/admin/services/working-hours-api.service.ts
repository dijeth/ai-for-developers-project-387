import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Weekday } from '@prisma/client';
import { WorkingHoursService } from '../../prisma/models/working-hours.service';
import { WorkingHoursDto } from '../../dto/working-hours/working-hours.dto';
import { CreateWorkingHoursDto } from '../../dto/working-hours/create-working-hours.dto';
import { UpdateWorkingHoursDto } from '../../dto/working-hours/update-working-hours.dto';
import { BulkReplaceWorkingHoursDto } from '../../dto/working-hours/bulk-replace-working-hours.dto';
import { DayOfWeek } from '../../common/enums/day-of-week.enum';

@Injectable()
export class WorkingHoursApiService {
  constructor(private workingHoursService: WorkingHoursService) {}

  async listWorkingHours(ownerId: string): Promise<WorkingHoursDto[]> {
    const records = await this.workingHoursService.findByOwnerId(ownerId);
    return records.map(this.mapToDto);
  }

  async createWorkingHours(ownerId: string, dto: CreateWorkingHoursDto): Promise<WorkingHoursDto> {
    const weekday = dto.weekday as unknown as Weekday;
    const existing = await this.workingHoursService.findByWeekday(ownerId, weekday);
    if (existing) {
      throw new ConflictException(`Working hours for ${dto.weekday} already exist`);
    }
    const record = await this.workingHoursService.create(ownerId, {
      weekday,
      startTime: dto.startTime,
      endTime: dto.endTime,
    });
    return this.mapToDto(record);
  }

  async updateWorkingHours(
    ownerId: string,
    weekday: DayOfWeek,
    dto: UpdateWorkingHoursDto,
  ): Promise<WorkingHoursDto> {
    const prismaWeekday = weekday as unknown as Weekday;
    const existing = await this.workingHoursService.findByWeekday(ownerId, prismaWeekday);
    if (!existing) {
      throw new NotFoundException(`Working hours for ${weekday} not found`);
    }
    const updated = await this.workingHoursService.update(ownerId, prismaWeekday, dto);
    return this.mapToDto(updated);
  }

  async deleteWorkingHours(ownerId: string, weekday: DayOfWeek): Promise<void> {
    const prismaWeekday = weekday as unknown as Weekday;
    const existing = await this.workingHoursService.findByWeekday(ownerId, prismaWeekday);
    if (!existing) {
      throw new NotFoundException(`Working hours for ${weekday} not found`);
    }
    await this.workingHoursService.delete(ownerId, prismaWeekday);
  }

  async replaceWorkingHours(ownerId: string, dto: BulkReplaceWorkingHoursDto): Promise<WorkingHoursDto[]> {
    const entries = dto.workingHours.map((item) => ({
      weekday: item.weekday as unknown as Weekday,
      startTime: item.startTime,
      endTime: item.endTime,
    }));
    const records = await this.workingHoursService.replaceAll(ownerId, entries);
    return records.map(this.mapToDto);
  }

  private mapToDto(record: {
    id: string;
    weekday: string;
    startTime: string;
    endTime: string;
  }): WorkingHoursDto {
    return {
      id: record.id,
      weekday: record.weekday as DayOfWeek,
      startTime: record.startTime,
      endTime: record.endTime,
    };
  }
}

import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OwnerApiService } from '../services/owner-api.service';
import { TimeOffApiService } from '../services/time-off-api.service';
import { UpdateOwnerDto } from '../../dto/owner/update-owner.dto';
import { CreateTimeOffDto, UpdateTimeOffDto } from '../../dto/owner/time-off-request.dto';
import { OwnerDto } from '../../dto/owner/owner.dto';
import { TimeOffDto } from '../../dto/owner/time-off.dto';

@Controller('api/admin')
export class AdminOwnerController {
  private readonly ownerId = 'owner';

  constructor(
    private ownerApiService: OwnerApiService,
    private timeOffApiService: TimeOffApiService,
  ) {}

  @Get('owner')
  async getOwner(): Promise<OwnerDto> {
    return this.ownerApiService.getOwner(this.ownerId);
  }

  @Put('owner')
  async updateOwner(@Body() dto: UpdateOwnerDto): Promise<OwnerDto> {
    return this.ownerApiService.updateOwner(this.ownerId, dto);
  }

  @Get('owner/time-offs')
  async listTimeOffs(): Promise<TimeOffDto[]> {
    return this.timeOffApiService.listTimeOffs(this.ownerId);
  }

  @Post('owner/time-offs')
  @HttpCode(HttpStatus.CREATED)
  async createTimeOff(@Body() dto: CreateTimeOffDto): Promise<TimeOffDto> {
    return this.timeOffApiService.createTimeOff(this.ownerId, dto);
  }

  @Put('owner/time-offs/:id')
  async updateTimeOff(
    @Param('id') id: string,
    @Body() dto: UpdateTimeOffDto,
  ): Promise<TimeOffDto> {
    return this.timeOffApiService.updateTimeOff(this.ownerId, id, dto);
  }

  @Delete('owner/time-offs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTimeOff(@Param('id') id: string): Promise<void> {
    return this.timeOffApiService.deleteTimeOff(this.ownerId, id);
  }
}

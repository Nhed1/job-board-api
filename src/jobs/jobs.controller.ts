import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { FilterJobsDto } from './dto/filter-jobs.dto';
import { CreateInteractionDto } from './dto/create-interaction.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  async findAll(@Query() filters: FilterJobsDto) {
    return this.jobsService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const job = await this.jobsService.findOne(id);
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  @Post(':id/save')
  async saveJob(
    @Param('id') jobId: string,
    @Body() createInteractionDto: CreateInteractionDto,
  ) {
    try {
      return await this.jobsService.saveJob(jobId, createInteractionDto.userId);
    } catch (error) {
      if (error instanceof Error && error.message === 'Job already saved') {
        throw new ConflictException('Job already saved');
      }
      throw error;
    }
  }

  @Post(':id/apply')
  async applyToJob(
    @Param('id') jobId: string,
    @Body() createInteractionDto: CreateInteractionDto,
  ) {
    try {
      return await this.jobsService.applyToJob(
        jobId,
        createInteractionDto.userId,
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Already applied to this job'
      ) {
        throw new ConflictException('Already applied to this job');
      }
      throw error;
    }
  }
}

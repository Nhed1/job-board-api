import {
  IsOptional,
  IsString,
  IsIn,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Database } from '../../../database.types';

export class FilterJobsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['full-time', 'part-time', 'contract', 'internship'])
  jobType?: Database['public']['Enums']['job_type_enum'];

  @IsOptional()
  @IsIn(['entry', 'mid', 'senior', 'lead'])
  experienceLevel?: Database['public']['Enums']['experience_level_enum'];

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  remoteFriendly?: boolean;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minSalary?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxSalary?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  userId?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  IsObject,
  Min,
  Max,
} from 'class-validator';

export class CreateGradeDto {
  @ApiProperty({ description: 'User ID' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Activity ID' })
  @IsNotEmpty()
  @IsUUID()
  activityId: string;

  @ApiProperty({ description: 'Course ID' })
  @IsNotEmpty()
  @IsUUID()
  courseId: string;

  @ApiProperty({ description: 'Maximum possible grade' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  maxGrade: number;

  @ApiPropertyOptional({ description: 'Actual grade' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  grade?: number;

  @ApiPropertyOptional({ description: 'Submission data' })
  @IsOptional()
  @IsObject()
  submissionData?: Record<string, any>;
}

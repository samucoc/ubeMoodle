import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsInt,
  MaxLength,
} from 'class-validator';
import { CourseFormat } from '../entities/course.entity';

export class CreateCourseDto {
  @ApiProperty({ example: 'Introduction to Computer Science' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ example: 'CS101' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  shortName: string;

  @ApiPropertyOptional({ example: 'Learn the fundamentals of computer science' })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({ enum: CourseFormat, default: CourseFormat.TOPICS })
  @IsOptional()
  @IsEnum(CourseFormat)
  format?: CourseFormat;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  selfEnrollment?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  enrollmentKey?: string;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsInt()
  numSections?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  maxStudents?: number;
}

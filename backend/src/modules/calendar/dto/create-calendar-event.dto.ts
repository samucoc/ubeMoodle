import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { EventType, EventRepeat } from '../entities/calendar-event.entity';

export class CreateCalendarEventDto {
  @ApiProperty({ example: 'Final Exam' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: EventType, default: EventType.USER })
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;

  @ApiProperty({ description: 'Start date/time' })
  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @ApiPropertyOptional({ description: 'End date/time' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @ApiPropertyOptional({ enum: EventRepeat, default: EventRepeat.NONE })
  @IsOptional()
  @IsEnum(EventRepeat)
  repeat?: EventRepeat;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  repeatUntil?: string;

  @ApiPropertyOptional({ default: '#3788d8' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  location?: string;

  @ApiPropertyOptional({ description: 'Course ID (for course-level events)' })
  @IsOptional()
  @IsUUID()
  courseId?: string;
}

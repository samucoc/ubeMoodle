import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { EnrollmentRole } from '../entities/enrollment.entity';

export class CreateEnrollmentDto {
  @ApiProperty({ description: 'User ID to enroll' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Course ID to enroll in' })
  @IsNotEmpty()
  @IsUUID()
  courseId: string;

  @ApiPropertyOptional({ enum: EnrollmentRole, default: EnrollmentRole.STUDENT })
  @IsOptional()
  @IsEnum(EnrollmentRole)
  role?: EnrollmentRole;

  @ApiPropertyOptional({ description: 'Enrollment expiration date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, IsArray, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ description: 'Recipient user ID' })
  @IsNotEmpty()
  @IsUUID()
  recipientId: string;

  @ApiPropertyOptional({ example: 'Hello!' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @ApiProperty({ example: 'Message body text' })
  @IsNotEmpty()
  @IsString()
  body: string;

  @ApiPropertyOptional({ default: 'plain' })
  @IsOptional()
  @IsString()
  bodyFormat?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contextUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

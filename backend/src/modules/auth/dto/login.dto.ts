import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'john.doe', description: 'Username or email' })
  @IsNotEmpty()
  @IsString()
  identity: string;

  @ApiProperty({ example: 'SecureP@ss123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

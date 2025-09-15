import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsPhoneNumber } from 'class-validator';

export class ValidatePhoneDto {
  @ApiProperty({
    description: 'Phone number to validate',
    example: '+1234567890',
  })
  @IsString()
  @IsPhoneNumber()
  readonly phoneNumber: string;
}
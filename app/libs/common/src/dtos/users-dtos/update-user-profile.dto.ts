import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateUserProfileDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address?: string;
}
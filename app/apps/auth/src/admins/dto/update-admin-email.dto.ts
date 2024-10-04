import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminDto } from './create-admin.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateAdminEmailDto {
  @ApiProperty({
    description: 'Admin ID, assigned from the request payload'
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({description: 'The new admin email address' })
  @IsNotEmpty()
  @IsEmail()
  email: string
}

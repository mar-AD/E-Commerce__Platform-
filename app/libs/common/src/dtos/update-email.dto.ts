import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminDto } from './create-admin.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateEmailDto {
  @ApiProperty({
    description: 'An ID, assigned from the request payload'
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({description: 'The new email address' })
  @IsNotEmpty()
  @IsEmail()
  email: string
}

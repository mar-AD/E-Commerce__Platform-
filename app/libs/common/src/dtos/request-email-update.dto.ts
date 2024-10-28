import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RequestEmailUpdateDto {
  @ApiProperty({description: 'Email'})
  @IsNotEmpty()
  @IsEmail()
  email : string;
}
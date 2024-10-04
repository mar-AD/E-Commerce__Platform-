import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RequestEmailUpdateDto {
  @ApiProperty({
    description: 'Admin ID, assigned from the request payload'
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({description: 'Admin email'})
  @IsNotEmpty()
  @IsEmail()
  email : string;
}
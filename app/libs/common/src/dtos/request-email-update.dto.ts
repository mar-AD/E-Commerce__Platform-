import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RequestEmailUpdateDto {
  @ApiProperty({
    description: 'AnID, assigned from the request payload'
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({description: 'Email'})
  @IsNotEmpty()
  @IsEmail()
  email : string;
}
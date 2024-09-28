import { ApiProperty } from '@nestjs/swagger';
import { isEmail, IsNotEmpty } from 'class-validator';

export class LoginAdminDto {
  @ApiProperty({ description: 'Email', example: 'email@gmail.com' })
  @IsNotEmpty()
  @isEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({ description: 'password', example: 'password123@' }))
  @IsNotEmpty()
  password: string;
}
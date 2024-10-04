import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginAdminDto {
  @ApiProperty({ description: 'Email', example: 'email@gmail.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({ description: 'password', example: 'password123@' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
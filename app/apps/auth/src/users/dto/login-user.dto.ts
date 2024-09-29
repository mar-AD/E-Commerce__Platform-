import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({example: "email@gmail.com", description: "User email address"})
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({example: "pass123$$", description: "User password"})
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
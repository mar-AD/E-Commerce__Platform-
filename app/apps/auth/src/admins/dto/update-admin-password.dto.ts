import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class UpdateAdminPasswordDto {
  @ApiProperty({
    example: 'passwordExample',
    description: 'Current password of the admin.',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    example: 'passwordExample',
    description: 'New password of the admin.',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!\"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d!\"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{8,}$/, {
    message:
      'Password must be at least 8 characters long and contain at least one letter, one number, and one special character.',
  })
  newPassword: string;

  @ApiProperty({
    example: 'passwordExample',
    description: 'Confirmation of the new password of the admin.',
  })
  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}
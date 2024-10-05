import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'An ID, assigned from the request payload'
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({
    example: 'passwordExample',
    description: 'Current password.',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    example: 'passwordExample',
    description: 'New password.',
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
    description: 'Confirmation of the new password.',
  })
  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}
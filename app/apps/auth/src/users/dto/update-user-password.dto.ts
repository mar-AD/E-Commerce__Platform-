import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class UpdateUserPasswordDto {
  @ApiProperty({
    description: 'User ID, assigned from the request payload'
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({
    description:'Current password of user',
    example:'125@ghg'
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description:'New password of user',
    example:'123456@gh'
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!\"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d!\"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{8,}$/, {
    message:
      'Password must be at least 8 characters long and contain at least one letter, one number, and one special character.',
  })
  newPassword: string;

  @ApiProperty({
    description:'Confirmation of the new password',
    example:'123456@gh'
  })
  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}
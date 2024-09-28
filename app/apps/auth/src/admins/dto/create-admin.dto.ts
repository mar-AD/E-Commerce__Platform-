import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ description: 'the name of the role assigned to the admin', example: 'supperAdmin' } )
  @IsNotEmpty()
  role: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!\"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d!\"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{8,}$/, {
    message:
      'Password must be at least 8 characters long and contain at least one letter, one number, and one special character.',
  })
  password: string;
}

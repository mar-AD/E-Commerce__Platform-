import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailCodeDto {
  @ApiProperty({
    description: 'Admin ID, assigned from the request payload'
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({description: 'The verification code that was sent to the admin email.', example: '123456'})
  @IsNotEmpty()
  @IsString()
  verificationCode: string;
}
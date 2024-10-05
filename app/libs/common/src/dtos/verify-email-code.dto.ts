import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailCodeDto {
  @ApiProperty({
    description: 'An ID, assigned from the request payload'
  })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({description: 'The verification code that was sent to the email.', example: '123456'})
  @IsNotEmpty()
  @IsString()
  verificationCode: string;
}
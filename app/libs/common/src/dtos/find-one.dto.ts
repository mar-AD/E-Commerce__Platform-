import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FindOneDto {
  @ApiProperty({
    description: 'An ID, assigned from the request payload'
  })
  @IsNotEmpty()
  @IsString()
  id: string;
}

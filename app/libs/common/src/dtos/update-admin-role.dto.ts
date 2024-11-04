import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateAdminRoleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  role: string
}
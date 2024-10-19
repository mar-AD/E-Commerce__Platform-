import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Permissions } from '@app/common';

export class CreateRoleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty( {isArray: true, enum: Permissions})
  @IsNotEmpty()
  @IsEnum(Permissions, {each: true})
  permissions: Permissions[];

}
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Permissions } from '@app/common';

export class CreateRoleDto {
  @ApiProperty({ description: 'Name of the role', example: 'super admin' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty( {isArray: true, enum: Permissions, description: 'permissions of the role', example: 'MANAGE_ORDERS'})
  @IsNotEmpty()
  @IsEnum(Permissions, {each: true})
  permissions: Permissions[];

}
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Permissions, PermissionsNames } from '@app/common';

export class CreateRoleDto {
  @ApiProperty({ description: 'Name of the role', example: 'super admin' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty( {isArray: true, enum: Permissions, description: 'permissions of the role', example: 'MANAGE_ORDERS'})
  @IsNotEmpty()
  @IsEnum(PermissionsNames, {each: true})
  permissions: Permissions[];

}
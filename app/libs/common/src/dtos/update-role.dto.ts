import { ApiProperty } from '@nestjs/swagger';
import { Permissions } from '@app/common';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from '@app/common/dtos/create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiProperty()
  @IsString()
  id: string;
}
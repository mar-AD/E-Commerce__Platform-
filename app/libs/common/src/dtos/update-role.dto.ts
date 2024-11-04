
import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from '@app/common/dtos/create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
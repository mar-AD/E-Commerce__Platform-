
import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from '@app/common/dtos/auth-dtos/create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
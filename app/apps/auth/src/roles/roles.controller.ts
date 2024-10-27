import { Controller } from '@nestjs/common';
import { RolesService } from './roles.service';
import {
  RoleServiceController,
  RoleServiceControllerMethods,
} from '@app/common';
import { CreateRoleDto, FindOneDto, UpdateRoleDto } from '@app/common/dtos';

@Controller()
@RoleServiceControllerMethods()
export class RolesController implements RoleServiceController{
  constructor(private readonly rolesService: RolesService) {}

  createRole(createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  getAllRoles() {
    return this.rolesService.findAll();
  }

  getRoleById(findOneDto: FindOneDto) {
    return this.rolesService.findOne(findOneDto);
  }

  updateRole(updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(updateRoleDto.id, updateRoleDto);
  }

  deleteRole(findOneDto: FindOneDto) {
    return this.rolesService.remove(findOneDto);
  }
}

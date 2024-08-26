import { Controller } from '@nestjs/common';
import { RolesService } from './roles.service';
import {
  CreateRoleDto,
  FindOneDto,
  RoleServiceController,
  RoleServiceControllerMethods,
  UpdateRoleDto,
} from '@app/common';

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
    return this.rolesService.findOne(findOneDto.id);
  }

  updateRole(updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(updateRoleDto.id, updateRoleDto);
  }

  deleteRole(findOneDto: FindOneDto) {
    return this.rolesService.remove(findOneDto.id);
  }
}

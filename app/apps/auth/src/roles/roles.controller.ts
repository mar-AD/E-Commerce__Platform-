import { Controller } from '@nestjs/common';
import { RolesService } from './roles.service';
import {
  FindOneDto,
  RoleServiceController,
  RoleServiceControllerMethods, UpdateRoleRequest,
} from '@app/common';
import { CreateRoleDto } from '@app/common/dtos';

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

  updateRole(updateRoleRequest: UpdateRoleRequest) {
    const {updateRoleDto, findOneDto} = updateRoleRequest;
    return this.rolesService.update(updateRoleDto, findOneDto);
  }

  deleteRole(findOneDto: FindOneDto) {
    return this.rolesService.remove(findOneDto);
  }
}

import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { AUTH_SERVICE } from '../constants';
import { ClientGrpc } from '@nestjs/microservices';
import { ROLE_SERVICE_NAME, RoleServiceClient } from '@app/common';
import { CreateRoleDto, FindOneDto, UpdateRoleDto } from '@app/common/dtos';

@Injectable()
export class RolesService implements OnModuleInit{
  private rolesService: RoleServiceClient;
  constructor(@Inject(AUTH_SERVICE) private client: ClientGrpc) {}
  onModuleInit() {
    this.rolesService = this.client.getService<RoleServiceClient>(ROLE_SERVICE_NAME)
  }

  create(createRoleDto: CreateRoleDto) {
    return this.rolesService.createRole(createRoleDto)
  }

  findAll() {
    return this.rolesService.getAllRoles({});
  }

  findOne(findOnsDto: FindOneDto) {
    return this.rolesService.getRoleById(findOnsDto);
  }

  update(id: string, updateRoleDto: UpdateRoleDto) {
    return this.rolesService.updateRole({id, ...updateRoleDto});
  }

  remove(findOnsDto: FindOneDto) {
    return this.rolesService.deleteRole(findOnsDto)
  }
}

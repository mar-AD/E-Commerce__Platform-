import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { AUTH_SERVICE } from '../constants';
import { ClientGrpc } from '@nestjs/microservices';
import { CreateRoleDto, ROLE_SERVICE_NAME, RoleServiceClient, UpdateRoleDto } from '@app/common';

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

  findOne(id: string) {
    return this.rolesService.getRoleById({ id });
  }

  update(id: string, updateRoleDto: UpdateRoleDto) {
    return this.rolesService.updateRole({id, ...updateRoleDto});
  }

  remove(id: string) {
    return this.rolesService.deleteRole({id})
  }
}

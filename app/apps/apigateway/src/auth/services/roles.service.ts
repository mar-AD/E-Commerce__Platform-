import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { AUTH_SERVICE } from '../../constants';
import { ClientGrpc } from '@nestjs/microservices';
import { FindOneDto, ROLE_SERVICE_NAME, RoleServiceClient, UpdateRoleRequest } from '@app/common';
import { CreateRoleDto } from '@app/common/dtos/auth-dtos';

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

  findOne(findOneDto: FindOneDto) {
    return this.rolesService.getRoleById(findOneDto);
  }

  update(updateRoleRequest: UpdateRoleRequest) {
    return this.rolesService.updateRole(updateRoleRequest);
  }

  remove(findOneDto: FindOneDto) {
    return this.rolesService.deleteRole(findOneDto)
  }
}

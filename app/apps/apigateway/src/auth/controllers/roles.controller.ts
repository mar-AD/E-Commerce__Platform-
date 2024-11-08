import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto, UpdateRoleDto } from '@app/common/dtos';
import {
  FindOneDto,
  getPermissionName,
  JwtAuthGuard,
  Permissions,
  PermissionsGuard,
  UpdateRoleRequest,
} from '@app/common';
import { PermissionsAndAccess } from '@app/common/utils/methadata';

@ApiTags('Roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('register')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_ROLES) })
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_ROLES) })
  getAllRoles() {
    return this.rolesService.findAll();
  }

  @Get('/:id')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_ROLES) })
  getRoleById(@Param('id') id: string) {
    const findOneDto: FindOneDto = { id };
    return this.rolesService.findOne(findOneDto);
  }

  @Patch('/:id')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_ROLES) })
  updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    const findOneDto: FindOneDto = { id };
    const updateRoleRequest: UpdateRoleRequest = { updateRoleDto, findOneDto };
    return this.rolesService.update(updateRoleRequest);
  }

  @Delete('/:id')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_ROLES) })
  deleteRole(@Param('id') id: string) {
    const findOneDto : FindOneDto = {id}
    return this.rolesService.remove(findOneDto);
  }
}

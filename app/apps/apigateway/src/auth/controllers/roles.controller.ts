import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto, FindOneDto, UpdateRoleDto } from '@app/common';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('roles/register')
  createRole(createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get('roles')
  getAllRoles() {
    return this.rolesService.findAll({});
  }

  @Get('roles/:id')
  getRoleById(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch('roles/:id')
  updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update({ id, updateRoleDto });
  }

  @Delete('roles/:id')
  deleteRole(id: string) {
    return this.rolesService.remove(id);
  }
}

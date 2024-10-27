import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto, FindOneDto, UpdateRoleDto } from '@app/common/dtos';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('register')
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  getAllRoles() {
    return this.rolesService.findAll();
  }

  @Get('/:id')
  getRoleById(@Param('id') id: string, @Body() findOnsDto: FindOneDto) {
    findOnsDto.id = id;
    return this.rolesService.findOne(findOnsDto);
  }

  @Patch('/:id')
  updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto );
  }

  @Delete('/:id')
  deleteRole(@Param('id') id: string, @Body() findOnsDto: FindOneDto) {
    findOnsDto.id = id;
    return this.rolesService.remove(findOnsDto);
  }
}

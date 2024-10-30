import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto, UpdateRoleDto } from '@app/common/dtos';
import { FindOneDto, UpdateRoleRequest } from '@app/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

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
  getRoleById(@Param('id') id: string) {
    const findOneDto: FindOneDto = { id };
    return this.rolesService.findOne(findOneDto);
  }

  @Patch('/:id')
  updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    const findOneDto: FindOneDto = { id };
    const updateRoleRequest: UpdateRoleRequest = { updateRoleDto, findOneDto };
    console.log('UpdateRoleRequest:', updateRoleRequest);
    return this.rolesService.update(updateRoleRequest);
  }

  @Delete('/:id')
  deleteRole(@Param('id') id: string) {
    const findOneDto : FindOneDto = {id}
    return this.rolesService.remove(findOneDto);
  }
}

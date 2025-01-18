import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  FindOneDto,
  getPermissionName,
  GetAdminProfileRequest, Non,
  None,
  Permissions,
  PermissionsAndAccess, JwtAuthGuard,
} from '@app/common';
import { Request } from 'express';
import { AdminsService } from './admins.service';
import { PermissionsGuard } from '../auth/guards/auth.guard';

@ApiTags('Admins')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {
  }

  //for admin to fetch admins profiles
  @Get('admin/profile/:id')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_USERS)})
  getProfile(@Param('id') id: string) {
    const findOneDto : FindOneDto = {id};
    const adminId = id
    const request: GetAdminProfileRequest = {adminId}
    return this.adminsService.getProfile(findOneDto, request);
  }

  @Get('admin/all-profiles')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_USERS)})
  getAdminsProfiles(request: None, request1: Non) {
    return this.adminsService.getAllProfiles(request, request1);
  }

  //for admin to fetch his profile
  @Get('admin/profile')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin'] })
  getAdminProfile(@Req() req: Request) {
    const id = req['user']['payload'].id;
    const adminId = req['user']['payload'].id;
    const findOneDto: FindOneDto = { id };
    const request: GetAdminProfileRequest = { adminId };
    return this.adminsService.getProfile(findOneDto, request);
  }
}

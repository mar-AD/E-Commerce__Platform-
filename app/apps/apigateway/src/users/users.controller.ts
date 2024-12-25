import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  FindOneDto,
  getPermissionName,
  GetUserProfileRequest,
  JwtAuthGuard, None,
  Permissions,
  PermissionsAndAccess,
} from '@app/common';
import { PermissionsGuard } from '../auth/guards/auth.guard';
import { UsersService } from './users.service';
import { Request } from 'express';

@ApiTags('Users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {
  }

  //for admin to fetch users profiles
  @Get('user/profile/:id')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_USERS)})
  getProfile(@Param('id') id: string, userId: string) {
    const findOneDto : FindOneDto = {id};
    const request: GetUserProfileRequest = {userId}
    return this.usersService.getProfile(findOneDto, request);
  }

  @Get('user/all-profiles')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_USERS)})
  getUsersProfiles(request: None) {
    return this.usersService.getAllProfiles(request);
  }

  //for user to fetch his profile
  @Get('user/profile')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['user']})
  getUserProfile(@Req() req: Request, userId: string) {
    const id = req['user']['payload'].id
    const findOneDto : FindOneDto = {id};
    const request: GetUserProfileRequest = {userId}
    return this.usersService.getProfile(findOneDto, request);
  }

}

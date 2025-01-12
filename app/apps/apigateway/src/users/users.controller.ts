import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  FindOneDto,
  getPermissionName,
  GetUserProfileRequest,
  JwtAuthGuard, Non, None,
  Permissions,
  PermissionsAndAccess,
} from '@app/common';
import { PermissionsGuard } from '../auth/guards/auth.guard';
import { UsersService } from './users.service';
import { Request } from 'express';
import { tap } from 'rxjs';

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
  getUsersProfiles(request: None, request1: Non) {
    return this.usersService.getAllProfiles(request, request1);
  }

  //for user to fetch his profile
  // @Get('user/profile')
  // @ApiBearerAuth()
  // @PermissionsAndAccess({ accessType: ['user']})
  // getUserProfile(@Req() req: Request, userId: string) {
  //   const id = req['user']['payload'].id
  //   const findOneDto : FindOneDto = {id};
  //   const request: GetUserProfileRequest = {userId}
  //   return this.usersService.getProfile(findOneDto, request);
  // }


  @Get('user/profile')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['user'] })
  getUserProfile(@Req() req: Request) {
    const id = req['user']['payload'].id;
    const userId = req['user']['payload'].id;
    const findOneDto: FindOneDto = { id };
    const request: GetUserProfileRequest = { userId };

    console.log('request log:', req['user']['payload']);
    console.log('Incoming Request to Get User Profile');
    console.log('Request User ID:', id);
    console.log('Request User Profile ID:', userId);
    console.log('findOneDto:', findOneDto);
    console.log('GetUserProfileRequest:', request);

    return this.usersService.getProfile(findOneDto, request).pipe(
      tap({
        next: (data) => console.log('getUserProfile Response:', data),
        error: (err) => console.error('getUserProfile Error:', err),
      }),
    );
  }

}

import { Controller, Post, Body, Patch, Param, Delete, Req, Get, UseGuards, Logger } from '@nestjs/common';
import { UserService } from '../services/user.service';
import {
  CreateDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto, RequestEmailUpdateDto, ResetPasswordDto,
  UpdateEmailDto,
  UpdatePasswordDto, VerifyEmailCodeDto,
} from '@app/common/dtos/auth-dtos' ;
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  FindOneDto, getPermissionName, isPublic, JwtAuthGuard,
  RequestUpdateEmailRequest,
  ResetPasswordRequest,
  TokenDto,
  UpdateEmailRequest, UpdatePasswordRequest,
  VerifyEmailCodeRequest,
  Permissions, Empty, None,
} from '@app/common';
import { PermissionsAndAccess } from '@app/common/utils/methadata';
import { PermissionsGuard } from '../guards/auth.guard';


@ApiTags('AuthUsers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('user/register')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_USERS) })
  // @isPublic()
  createUser(@Body() createUserDto: CreateDto) {
    return this.userService.create(createUserDto);
  }

  @Post('user/login')
  @isPublic()
  userLogin(@Body() loginRequest: LoginDto) {
    return this.userService.login(loginRequest);
  }

  @Patch('userPassUpdate')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['user'] })
  updateUserPassword(@Req() req: Request, @Body() updatePasswordDto: UpdatePasswordDto) {
    const id = req['user']['payload'].id
    const findOneDto : FindOneDto = {id};
    const updatePasswordRequest: UpdatePasswordRequest = { updatePasswordDto, findOneDto}
    return this.userService.updatePassword(updatePasswordRequest);
  }

  @Post('user/requestEmailUpdate')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['user'] })
  RequestAdminEmailUpdate(@Req() req: Request, @Body() requestEmailUpdateDto: RequestEmailUpdateDto) {
    const id = req['user']['payload'].id
    const findOneDto : FindOneDto = {id};
    const requestUpdateEmailDto: RequestUpdateEmailRequest = {requestEmailUpdateDto, findOneDto}
    return this.userService.RequestEmailUpdate(requestUpdateEmailDto)
  }

  @Post('user/verifyEmailCode')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['user'] })
  verifyEmailCode(@Req() req: Request, @Body() verifyEmailCodeDto: VerifyEmailCodeDto) {
    const id = req['user']['payload'].id
    const findOneDto : FindOneDto = {id};
    const verifyEmailCodeRequest: VerifyEmailCodeRequest = {verifyEmailCodeDto, findOneDto}
    return this.userService.verifyEmailCode(verifyEmailCodeRequest)
  }

  @Patch('userEmailUpdate')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['user'] })
  updateUserEmail(@Req() req: Request, @Body() updateEmailDto: UpdateEmailDto) {
    const id = req['user']['payload'].id
    const findOneDto : FindOneDto = {id};
    const updateEmailRequest: UpdateEmailRequest = {updateEmailDto, findOneDto}
    return this.userService.updateEmail(updateEmailRequest);
  }

  @Post('user/logout')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['user'] })
  logoutUser(@Body() logoutDto: RefreshTokenDto) {
    return this.userService.logout(logoutDto);
  }

  @Post('user/refresh-token')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['user'] })
  userRefreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.userService.refreshToken(refreshTokenDto);
  }

  @Post('user/forgot-password')
  @isPublic()
  userForgotPassword(@Body() forgotPassDto: ForgotPasswordDto) {
    return this.userService.forgotPassword(forgotPassDto);
  }

  @Post('user/reset-password/:token')
  @isPublic()
  userResetPassword(@Param('token') token: string, @Body() resetPasswordDto: ResetPasswordDto) {
    const tokenDto : TokenDto = { token };
    const resetPasswordRequest: ResetPasswordRequest = {resetPasswordDto, tokenDto}
    return this.userService.resetPassword(resetPasswordRequest);
  }

  @Delete('user/remove')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['user'] })
  remove(@Req() req: Request) {
    const id = req['user']['payload'].id
    const findOneDto : FindOneDto = {id};
    return this.userService.remove(findOneDto);
  }

//   @Get('user/:id')
//   @ApiBearerAuth()
//   @PermissionsAndAccess({ accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_USERS) })
//   getUser(@Param('id') id : string) {
//     const findOneDto : FindOneDto = {id};
//     return this.userService.getUser(findOneDto);
//   }

  @Patch('user/update-profile')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['user']})
  updateUserProfile(@Req() req: Request) {
    const id = req['user']['payload'].id
    const findOneDto : FindOneDto = {id};
     return this.userService.updateUserProfile(findOneDto);
  }

  @Delete('user/remove-user-profile/:id')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_USERS) })
  deleteUserProfile(@Param('id') id: string) {
    const findOneDto : FindOneDto = {id};
    return this.userService.deleteUserProfile(findOneDto);
  }

  @Get('user/getAll')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_USERS) })
  getAll(request: None) {
    return this.userService.getAllEntities(request);
  }
}

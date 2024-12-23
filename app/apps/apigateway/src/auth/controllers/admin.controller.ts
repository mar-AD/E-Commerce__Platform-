import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import {
  CreateAdminDto, ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto, RequestEmailUpdateDto, ResetPasswordDto,
  UpdateEmailDto,
  UpdatePasswordDto, UpdateAdminRoleDto, VerifyEmailCodeDto,
} from '@app/common/dtos/auth-dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  Empty,
  FindOneDto, getPermissionName, isPublic, JwtAuthGuard, None, Permissions, RequestUpdateEmailRequest,
  ResetPasswordRequest,
  TokenDto, UpdateAdminRoleRequest,
  UpdateEmailRequest, UpdatePasswordRequest,
  VerifyEmailCodeRequest,
} from '@app/common';
import { PermissionsAndAccess } from '@app/common/utils/methadata';
import { PermissionsGuard } from '../guards/auth.guard';


@ApiTags('AuthAdmins')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('admin/register')
  // @ApiBearerAuth()
  // @PermissionsAndAccess({ accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_ADMINS) })
  @isPublic()
  createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @Post('admin/login')
  @isPublic()
  adminLogin(@Body() loginRequest: LoginDto) {
    return this.adminService.login(loginRequest);
  }

  @Patch('adminPassUpdate')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin'] })
  updateAdminPassword(@Req() req: Request, @Body() updatePasswordDto: UpdatePasswordDto) {
    const id = req['user']['payload'].id
    const findOneDto : FindOneDto = {id};
    const updatePasswordRequest: UpdatePasswordRequest = { updatePasswordDto, findOneDto}
    return this.adminService.updatePassword(updatePasswordRequest);
  }

  @Post('admin/requestEmailUpdate')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin'] })
  RequestAdminEmailUpdate(@Req() req: Request, @Body() requestEmailUpdateDto: RequestEmailUpdateDto) {
    const id = req['user']['payload'].id
    const findOneDto : FindOneDto = {id};
    const requestUpdateEmailDto: RequestUpdateEmailRequest = {requestEmailUpdateDto, findOneDto}
    return this.adminService.RequestEmailUpdate(requestUpdateEmailDto)
  }

  @Post('admin/verifyEmailCode')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin'] })
  verifyEmailCode(@Req() req: Request, @Body() verifyEmailCodeDto: VerifyEmailCodeDto) {
    const id = req['user']['payload'].id
    const findOneDto : FindOneDto = {id};
    const verifyEmailCodeRequest: VerifyEmailCodeRequest = {verifyEmailCodeDto, findOneDto}
    return this.adminService.verifyEmailCode(verifyEmailCodeRequest)
  }

  @Patch('adminEmailUpdate')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin'] })
  updateAdminEmail(@Req() req: Request, @Body() updateEmailDto: UpdateEmailDto) {
    const id = req['user']['payload'].id
    const findOneDto : FindOneDto = {id};
    const updateEmailRequest: UpdateEmailRequest = {updateEmailDto, findOneDto}
    return this.adminService.updateEmail(updateEmailRequest);
  }

  @Patch('adminRoleUpdate/:id')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_ADMINS) })
  UpdateAdminRole(@Param('id') id: string, @Body() updateAdminRoleDto: UpdateAdminRoleDto) {
    const findOneDto : FindOneDto = {id};
    const updateAdminRoleRequest: UpdateAdminRoleRequest = {updateAdminRoleDto, findOneDto}
    return this.adminService.updateRole(updateAdminRoleRequest);
  }

  @Post('admin/logout')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin'] })
  logoutAdmin(@Body() logoutDto: RefreshTokenDto) {
    return this.adminService.logout(logoutDto);
  }

  @Post('admin/refresh-token')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin'] })
  adminRefreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.adminService.refreshToken(refreshTokenDto);
  }

  @Post('admin/forgot-password')
  @isPublic()
  adminForgotPassword(@Body() forgotPassDto: ForgotPasswordDto) {
    return this.adminService.forgotPassword(forgotPassDto);
  }

  @Post('admin/reset-password/:token')
  @isPublic()
  adminResetPassword(@Param('token') token: string, @Body() resetPasswordDto: ResetPasswordDto) {
    const tokenDto : TokenDto = { token };
    const resetPasswordRequest: ResetPasswordRequest = {resetPasswordDto, tokenDto}
    return this.adminService.resetPassword(resetPasswordRequest);
  }

  @Delete('admin/remove')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin'] })
  remove(@Req() req: Request) {
    const id = req['user']['payload'].id
    const findOneDto : FindOneDto = {id};
    return this.adminService.remove(findOneDto);
  }

  @Patch('admin/update-profile')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin']})
  updateAdminProfile(@Req() req: Request) {
    const id = req['user']['payload'].id
    const findOneDto : FindOneDto = {id};
    return this.adminService.updateAdminProfile(findOneDto);
  }

  @Delete('admin/remove-admin-profile/:id')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_ADMINS) })
  deleteUserProfile(@Param('id') id: string) {
    const findOneDto : FindOneDto = {id};
    return this.adminService.deleteAdminProfile(findOneDto);
  }

  @Get('admin/getAll')
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_ADMINS) })
  getAll(request: None) {
    return this.adminService.getAllEntities(request);
  }
}

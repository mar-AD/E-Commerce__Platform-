import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import {
  CreateAdminDto, ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto, RequestEmailUpdateDto, ResetPasswordDto,
  UpdateEmailDto,
  UpdatePasswordDto, UpdateAdminRoleDto, VerifyEmailCodeDto,
} from '@app/common/dtos';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  FindOneDto, RequestUpdateEmailRequest,
  ResetPasswordRequest,
  TokenDto, UpdateAdminRoleRequest,
  UpdateEmailRequest, UpdatePasswordRequest,
  VerifyEmailCodeRequest,
} from '@app/common';

@ApiTags('AuthAdmins')
@Controller('auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('admin/register')
  createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @Post('admin/login')
  adminLogin(@Body() loginRequest: LoginDto) {
    return this.adminService.login(loginRequest);
  }

  @Patch('adminPassUpdate')
  updateAdminPassword(@Req() req: Request, @Body() updatePasswordDto: UpdatePasswordDto) {
    const id = req['payload'].id
    const findOneDto : FindOneDto = {id};
    const updatePasswordRequest: UpdatePasswordRequest = { updatePasswordDto, findOneDto}
    return this.adminService.updatePassword(updatePasswordRequest);
  }

  @Post('admin/requestEmailUpdate')
  RequestAdminEmailUpdate(@Req() req: Request, @Body() requestEmailUpdateDto: RequestEmailUpdateDto) {
    const id = req['payload'].id
    const findOneDto : FindOneDto = {id};
    const requestUpdateEmailDto: RequestUpdateEmailRequest = {requestEmailUpdateDto, findOneDto}
    return this.adminService.RequestEmailUpdate(requestUpdateEmailDto)
  }

  @Get('admin/verifyEmailCode')
  verifyEmailCode(@Req() req: Request, @Body() verifyEmailCodeDto: VerifyEmailCodeDto) {
    const id = req['payload'].id
    const findOneDto : FindOneDto = {id};
    const verifyEmailCodeRequest: VerifyEmailCodeRequest = {verifyEmailCodeDto, findOneDto}
    return this.adminService.verifyEmailCode(verifyEmailCodeRequest)
  }

  @Patch('adminEmailUpdate')
  updateAdminEmail(@Req() req: Request, @Body() updateEmailDto: UpdateEmailDto) {
    const id = req['payload'].id
    const findOneDto : FindOneDto = {id};
    const updateEmailRequest: UpdateEmailRequest = {updateEmailDto, findOneDto}
    return this.adminService.updateEmail(updateEmailRequest);
  }

  @Patch('adminRoleUpdate/:id')
  UpdateAdminRole(@Param('id') id: string, @Body() updateAdminRoleDto: UpdateAdminRoleDto) {
    const findOneDto : FindOneDto = {id};
    const updateAdminRoleRequest: UpdateAdminRoleRequest = {updateAdminRoleDto, findOneDto}
    return this.adminService.updateRole(updateAdminRoleRequest);
  }

  @Post('admin/logout')
  logoutAdmin(@Body() logoutDto: RefreshTokenDto) {
    return this.adminService.logout(logoutDto);
  }

  @Post('admin/refresh-token')
  adminRefreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.adminService.refreshToken(refreshTokenDto);
  }

  @Post('admin/forgot-password')
  adminForgotPassword(@Body() forgotPassDto: ForgotPasswordDto) {
    return this.adminService.forgotPassword(forgotPassDto);
  }

  @Post('admin/reset-password/token')
  adminResetPassword(@Param('token') token: string, @Body() resetPasswordDto: ResetPasswordDto) {
    const tokenDto : TokenDto = { token };
    const resetPasswordRequest: ResetPasswordRequest = {resetPasswordDto, tokenDto}
    return this.adminService.resetPassword(resetPasswordRequest);
  }

  @Delete('admin/remove')
  remove(@Req() req: Request) {
    const id = req['payload'].id
    const findOneDto : FindOneDto = {id};
    return this.adminService.remove(findOneDto);
  }

}

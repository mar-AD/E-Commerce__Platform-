import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import {
  CreateAdminDto, ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto, RequestEmailUpdateDto, ResetPasswordDto,
  UpdateEmailDto,
  UpdatePasswordDto, UpdateAdminRoleDto, VerifyEmailCodeDto, FindOneDto,
} from '@app/common/dtos';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

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
    updatePasswordDto.id = req['payload'].id;
    return this.adminService.updatePassword(updatePasswordDto);
  }

  @Post('admin/requestEmailUpdate')
  RequestAdminEmailUpdate(@Req() req: Request, @Body() requestAdminEmailUpdate: RequestEmailUpdateDto) {
    requestAdminEmailUpdate.id = req['payload'].id;
    return this.adminService.RequestEmailUpdate(requestAdminEmailUpdate)
  }

  @Get('admin/verifyEmailCode')
  verifyEmailCode(@Req() req: Request, @Body() verifyEmailCodeDto: VerifyEmailCodeDto) {
    verifyEmailCodeDto.id = req['payload'].id;
    return this.adminService.verifyEmailCode(verifyEmailCodeDto)
  }

  @Patch('adminEmailUpdate')
  updateAdminEmail(@Req() req: Request, @Body() updateEmailDto: UpdateEmailDto) {
    updateEmailDto.id = req['payload'].id;
    return this.adminService.updateEmail(updateEmailDto);
  }

  @Patch('adminRoleUpdate/:id')
  UpdateAdminRole(@Param('id') id: string, @Body() updateAdminRoleDto: UpdateAdminRoleDto) {
    return this.adminService.updateRole(id, updateAdminRoleDto );
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
    resetPasswordDto.token = token;
    return this.adminService.resetPassword(resetPasswordDto);
  }

  @Delete('admin/remove')
  remove(@Req() req: Request, @Body() findOneDto: FindOneDto) {
    findOneDto.id = req['payload'].id
    return this.adminService.remove(findOneDto);
  }

}

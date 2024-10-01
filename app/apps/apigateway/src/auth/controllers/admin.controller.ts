import { Body, Controller, Delete, Param, Patch, Post, Req } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import {
  CreateAdminDto, ForgotPasswordDto,
  LoginDto,
  LogoutDto,
  RefreshTokenDto, ResetPasswordDto,
  UpdateAdminEmailDto,
  UpdateAdminPasswordDto,
} from '@app/common';
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

  @Patch('adminPupdate/:id')
  updateAdminPassword(@Req() req: Request, @Body() updatePasswordDto: UpdateAdminPasswordDto) {
    const {id} = req['payload']
    return this.adminService.updatePassword(id, updatePasswordDto);
  }

  @Patch('adminEupdate/:id')
  updateAdminEmail(@Req() req: Request, @Body() updateEmailDto: UpdateAdminEmailDto) {
    const {id} = req['payload']
    return this.adminService.updateEmail(id, updateEmailDto);
  }

  @Post('admin/logout')
  logoutAdmin(@Body() logoutDto: LogoutDto) {
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

  @Post('admin/reset-password')
  adminResetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.adminService.resetPassword(resetPasswordDto);
  }

  @Delete('admin/:id')
  remove(@Req() req: Request) {
    const {id} = req['payload']
    return this.adminService.remove(id);
  }

}

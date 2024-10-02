import { Body, Controller, Delete, Param, Patch, Post, Req, ValidationPipe } from '@nestjs/common';
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
  createAdmin(@Body(ValidationPipe) createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @Post('admin/login')
  adminLogin(@Body(ValidationPipe) loginRequest: LoginDto) {
    return this.adminService.login(loginRequest);
  }

  @Patch('adminPassUpdate')
  updateAdminPassword(@Req() req: Request, @Body(ValidationPipe) updatePasswordDto: UpdateAdminPasswordDto) {
    updatePasswordDto.id = req['payload'].id;
    return this.adminService.updatePassword(updatePasswordDto);
  }

  @Patch('adminEmailUpdate')
  updateAdminEmail(@Req() req: Request, @Body(ValidationPipe) updateEmailDto: UpdateAdminEmailDto) {
    updateEmailDto.id = req['payload'].id;
    return this.adminService.updateEmail(updateEmailDto);
  }

  @Post('admin/logout')
  logoutAdmin(@Body(ValidationPipe) logoutDto: LogoutDto) {
    return this.adminService.logout(logoutDto);
  }

  @Post('admin/refresh-token')
  adminRefreshToken(@Body(ValidationPipe) refreshTokenDto: RefreshTokenDto) {
    return this.adminService.refreshToken(refreshTokenDto);
  }

  @Post('admin/forgot-password')
  adminForgotPassword(@Body(ValidationPipe) forgotPassDto: ForgotPasswordDto) {
    return this.adminService.forgotPassword(forgotPassDto);
  }

  @Post('admin/reset-password')
  adminResetPassword(@Body(ValidationPipe) resetPasswordDto: ResetPasswordDto) {
    return this.adminService.resetPassword(resetPasswordDto);
  }

  @Delete('admin')
  remove(@Req() req: Request) {
    const {id} = req['payload']
    return this.adminService.remove(id);
  }

}

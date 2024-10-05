import { Body, Controller, Delete, Get, Param, Patch, Post, Req, ValidationPipe } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import {
  CreateAdminDto, ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto, RequestEmailUpdateDto, ResetPasswordDto,
  UpdateEmailDto,
  UpdatePasswordDto, UpdateAdminRoleDto, VerifyEmailCodeDto, FindOneDto,
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
  updateAdminPassword(@Req() req: Request, @Body(ValidationPipe) updatePasswordDto: UpdatePasswordDto) {
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
  updateAdminEmail(@Req() req: Request, @Body(ValidationPipe) updateEmailDto: UpdateEmailDto) {
    updateEmailDto.id = req['payload'].id;
    return this.adminService.updateEmail(updateEmailDto);
  }

  @Patch('adminRoleUpdate/:id')
  UpdateAdminRole(@Param('id') id: string, @Body(ValidationPipe) updateAdminRoleDto: UpdateAdminRoleDto) {
    return this.adminService.updateRole(id, updateAdminRoleDto );
  }

  @Post('admin/logout')
  logoutAdmin(@Req() req: Request, @Body(ValidationPipe) logoutDto: FindOneDto) {
    logoutDto.id = req['payload'].id
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

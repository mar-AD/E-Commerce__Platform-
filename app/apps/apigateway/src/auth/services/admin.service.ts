import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  ADMIN_SERVICE_NAME,
  AdminServiceClient, CreateAdminDto,
  ForgotPasswordDto,
  LoginDto, LogoutDto, RefreshTokenDto, ResetPasswordDto, UpdateAdminEmailDto, UpdateAdminPasswordDto,
} from '@app/common';
import { AUTH_SERVICE } from '../constants';
import { ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class AdminService implements OnModuleInit{
  private adminService: AdminServiceClient;

  constructor(@Inject(AUTH_SERVICE) private client: ClientGrpc) {}
  onModuleInit() {
    this.adminService = this.client.getService<AdminServiceClient>(ADMIN_SERVICE_NAME)
  }

  create(createAdminDto: CreateAdminDto) {
    return this.adminService.createAdmin(createAdminDto)
  }

  login(loginRequest: LoginDto) {
    return this.adminService.adminLogin(loginRequest);
  }

  updatePassword(updatePasswordDto: UpdateAdminPasswordDto) {
    return this.adminService.updateAdminPassword(updatePasswordDto);
  }

  updateEmail(updateEmailDto: UpdateAdminEmailDto) {
    return this.adminService.updateAdminEmail(updateEmailDto);
  }

  logout(logoutDto: LogoutDto){
    return this.adminService.logoutAdmin(logoutDto);
  }

  refreshToken(refreshTokenDto: RefreshTokenDto){
    return this.adminService.adminRefreshToken(refreshTokenDto)
  }

  forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    return this.adminService.adminForgotPassword(forgotPasswordDto)
  }

  resetPassword(resetPasswordDto: ResetPasswordDto) {
    return this.adminService.adminResetPassword(resetPasswordDto)
  }

  remove(id: string) {
    return this.adminService.removeAdmin({ id });
  }
}

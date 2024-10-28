import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  ADMIN_SERVICE_NAME,
  AdminServiceClient,
  CreateAdminDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RequestEmailUpdateDto,
  ResetPasswordDto,
  UpdateEmailDto,
  UpdatePasswordDto, UpdateAdminRoleDto, VerifyEmailCodeDto, FindOneDto, TokenDto,
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

  updatePassword(updatePasswordDto: UpdatePasswordDto, findOneDto: FindOneDto) {
    return this.adminService.updateAdminPassword(updatePasswordDto, findOneDto);
  }

  RequestEmailUpdate(requestEmailUpdateDto:RequestEmailUpdateDto, findOneDto: FindOneDto) {
    return this.adminService.requestUpdateAdminEmail(requestEmailUpdateDto, findOneDto)
  }

  verifyEmailCode(verifyEmailCodeDto: VerifyEmailCodeDto, findOneDto: FindOneDto) {
    return this.adminService.verifyEmailCode(verifyEmailCodeDto, findOneDto)
  }

  updateEmail(updateEmailDto: UpdateEmailDto, findOneDto: FindOneDto) {
    return this.adminService.updateAdminEmail(updateEmailDto, findOneDto);
  }

  updateRole(updateAdminRoleDto: UpdateAdminRoleDto, findOneDto: FindOneDto) {
    return this.adminService.updateAdminRole(updateAdminRoleDto, findOneDto);
  }

  logout(logoutDto: RefreshTokenDto){
    return this.adminService.logoutAdmin(logoutDto);
  }

  refreshToken(refreshTokenDto: RefreshTokenDto){
    return this.adminService.adminRefreshToken(refreshTokenDto)
  }

  forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    return this.adminService.adminForgotPassword(forgotPasswordDto)
  }

  resetPassword(resetPasswordDto: ResetPasswordDto, tokenDto: TokenDto) {
    return this.adminService.adminResetPassword(resetPasswordDto, tokenDto)
  }

  remove(findOneDto: FindOneDto) {
    return this.adminService.removeAdmin(findOneDto);
  }
}

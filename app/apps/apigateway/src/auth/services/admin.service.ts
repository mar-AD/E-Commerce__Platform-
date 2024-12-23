import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  ADMIN_SERVICE_NAME,
  AdminServiceClient,
  CreateAdminDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  FindOneDto,
  ResetPasswordRequest,
  UpdateEmailRequest,
  VerifyEmailCodeRequest,
  RequestUpdateEmailRequest,
  UpdatePasswordRequest,
  UpdateAdminRoleRequest, Empty, None,
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

  updatePassword(updatePasswordDto: UpdatePasswordRequest) {
    return this.adminService.updateAdminPassword(updatePasswordDto);
  }

  RequestEmailUpdate(requestEmailUpdateDto:RequestUpdateEmailRequest) {
    return this.adminService.requestUpdateAdminEmail(requestEmailUpdateDto)
  }

  verifyEmailCode(verifyEmailCodeRequest: VerifyEmailCodeRequest) {
    return this.adminService.verifyEmailCode(verifyEmailCodeRequest)
  }

  updateEmail(updateEmailRequest: UpdateEmailRequest) {
    return this.adminService.updateAdminEmail(updateEmailRequest);
  }

  updateRole(updateAdminRoleRequest: UpdateAdminRoleRequest) {
    return this.adminService.updateAdminRole(updateAdminRoleRequest);
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

  resetPassword(resetPasswordRequest: ResetPasswordRequest) {
    return this.adminService.adminResetPassword(resetPasswordRequest)
  }

  remove(findOneDto: FindOneDto) {
    return this.adminService.removeAdmin(findOneDto);
  }

  updateAdminProfile(findOneDto: FindOneDto) {
    return this.adminService.updateAdminProfile(findOneDto)
  }

  deleteAdminProfile(findOneDto: FindOneDto) {
    return this.adminService.deleteAdminProfile(findOneDto);
  }

  getAllEntities(request: None){
    return this.adminService.getAllAdmins(request)
  }
}

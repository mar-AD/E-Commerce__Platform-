import { Controller } from '@nestjs/common';
import { AdminsService } from './admins.service';
import {
  AdminServiceController,
  AdminServiceControllerMethods,
  FindOneDto,
  RequestEmailUpdateDto,
  RequestUpdateEmailRequest, ResetPasswordRequest,
  TokenDto,
  UpdateAdminRoleRequest,
  UpdateEmailRequest,
  UpdatePasswordRequest,
  VerifyEmailCodeDto,
  VerifyEmailCodeRequest,
} from '@app/common';
import { CreateAdminDto } from '@app/common/dtos/create-admin.dto';
import { UpdateAdminRoleDto } from '@app/common/dtos/update-admin-role.dto';
import { LoginDto, RefreshTokenDto, UpdateEmailDto, UpdatePasswordDto, ForgotPasswordDto, ResetPasswordDto } from '@app/common/dtos';

@Controller()
@AdminServiceControllerMethods()
export class AdminsController implements AdminServiceController{
  constructor(private readonly adminsService: AdminsService) {}

  createAdmin(createAdminDto: CreateAdminDto) {
    return this.adminsService.createAdmin(createAdminDto);
  }

  adminLogin( loginDto : LoginDto) {
    return this.adminsService.adminLogin(loginDto)
  }

  updateAdminPassword(updatePasswordRequest: UpdatePasswordRequest) {
    const {updatePasswordDto, findOneDto} = updatePasswordRequest;
    return this.adminsService.updateAdminPassword(updatePasswordDto, findOneDto);
  }

  requestUpdateAdminEmail(requestUpdateEmailRequest: RequestUpdateEmailRequest){
    const {requestEmailUpdateDto, findOneDto } = requestUpdateEmailRequest;
    return this.adminsService.requestUpdateEmail(requestEmailUpdateDto, findOneDto)
  }

  verifyEmailCode (verifyEmailCodeRequest: VerifyEmailCodeRequest){
    const {verifyEmailCodeDto, findOneDto} = verifyEmailCodeRequest;
    return this.adminsService.verifyEmailCode(verifyEmailCodeDto, findOneDto)
  }

  updateAdminEmail(updateEmailRequest: UpdateEmailRequest) {
    const {updateEmailDto, findOneDto} = updateEmailRequest;
    return this.adminsService.updateAdminEmail(updateEmailDto, findOneDto);
  }

  updateAdminRole(updateAdminRoleRequest: UpdateAdminRoleRequest) {
    const {updateAdminRoleDto, findOneDto} = updateAdminRoleRequest;
    return this.adminsService.updateAdminRole(updateAdminRoleDto, findOneDto);
  }

  logoutAdmin(logoutDto: RefreshTokenDto) {
    return this.adminsService.logoutAdmin(logoutDto);
  }

  adminRefreshToken(refreshTokenDto: RefreshTokenDto) {
    return this.adminsService.adminRefreshToken(refreshTokenDto);
  }

  adminForgotPassword(forgotPassDto: ForgotPasswordDto) {
    return this.adminsService.adminForgotPassword(forgotPassDto);
  }

  adminResetPassword(resetPasswordRequest: ResetPasswordRequest) {
    const {resetPasswordDto, tokenDto} = resetPasswordRequest;
    return this.adminsService.adminResetPassword(resetPasswordDto, tokenDto);
  }

  removeAdmin(findOneDto: FindOneDto) {
    return this.adminsService.deleteAdmin(findOneDto);
  }
}

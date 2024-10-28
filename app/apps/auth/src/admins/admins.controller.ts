import { Controller } from '@nestjs/common';
import { AdminsService } from './admins.service';
import {
  AdminServiceController,
  AdminServiceControllerMethods, FindOneDto,
  RequestEmailUpdateDto, TokenDto,
  VerifyEmailCodeDto,
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

  updateAdminPassword(updateAdminPassDto: UpdatePasswordDto, findOneDto: FindOneDto) {
    return this.adminsService.updateAdminPassword(updateAdminPassDto, findOneDto);
  }

  requestUpdateAdminEmail(requestEmailUpdateDto:RequestEmailUpdateDto, findOneDto: FindOneDto){
    return this.adminsService.requestUpdateEmail(requestEmailUpdateDto, findOneDto)
  }

  verifyEmailCode (verifyEmailCodeDto: VerifyEmailCodeDto, findOneDto: FindOneDto){
    return this.adminsService.verifyEmailCode(verifyEmailCodeDto, findOneDto)
  }

  updateAdminEmail(updateAdminEmailDto: UpdateEmailDto, findOneDto: FindOneDto) {
    return this.adminsService.updateAdminEmail(updateAdminEmailDto, findOneDto);
  }

  updateAdminRole(updateAdminRoleDto: UpdateAdminRoleDto, findOneDto: FindOneDto) {
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

  adminResetPassword(resetPasswordDto: ResetPasswordDto, tokenDto: TokenDto) {
    return this.adminsService.adminResetPassword(resetPasswordDto, tokenDto);
  }

  removeAdmin(findOneDto: FindOneDto) {
    return this.adminsService.deleteAdmin(findOneDto);
  }
}

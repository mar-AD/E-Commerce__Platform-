import { Controller } from '@nestjs/common';
import { AdminsService } from './admins.service';
import {
  AdminServiceController,
  AdminServiceControllerMethods, FindOneDto, ForgotPasswordDto,
  LogoutDto, RefreshTokenDto, RequestEmailUpdateDto, ResetPasswordDto,
  VerifyEmailCodeDto,
} from '@app/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminRoleDto } from './dto/update-admin-role.dto';
import { LoginDto, UpdateEmailDto, UpdatePasswordDto } from '@app/common/dtos';

@Controller()
@AdminServiceControllerMethods()
export class AdminsController implements AdminServiceController{
  constructor(private readonly adminsService: AdminsService) {}

  createAdmin(createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  adminLogin( loginDto : LoginDto) {
    return this.adminsService.adminLogin(loginDto)
  }

  updateAdminPassword(updateAdminPassDto: UpdatePasswordDto) {
    return this.adminsService.updateAdminPassword(updateAdminPassDto);
  }

  requestUpdateAdminEmail(requestEmailUpdateDto:RequestEmailUpdateDto){
    return this.adminsService.requestUpdateEmail(requestEmailUpdateDto)
  }

  verifyEmailCode (verifyEmailCodeDto: VerifyEmailCodeDto){
    return this.adminsService.verifyEmailCode(verifyEmailCodeDto)
  }

  updateAdminEmail(updateAdminEmailDto: UpdateEmailDto) {
    return this.adminsService.updateAdminEmail(updateAdminEmailDto);
  }

  updateAdminRole(updateAdminRoleDto: UpdateAdminRoleDto) {
    return this.adminsService.updateAdminRole(updateAdminRoleDto.id, updateAdminRoleDto);
  }

  logoutAdmin(logoutDto: FindOneDto) {
    return this.adminsService.logoutAdmin(logoutDto);
  }

  // adminRefreshToken(refreshTokenDto: RefreshTokenDto) {
  //   return this.adminsService.adminRefreshToken(refreshTokenDto.refreshToken);
  // }
  //
  // adminForgotPassword(forgotPassDto: ForgotPasswordDto) {
  //   return this.adminsService.adminForgotPassword(forgotPassDto.email);
  // }
  //
  // adminResetPassword(resetPasswordDto: ResetPasswordDto) {
  //   return this.adminsService.adminResetPassword(resetPasswordDto);
  // }
  //
  // removeAdmin(findOneDto: FindOneDto) {
  //   return this.adminsService.remove(findOneDto.id);
  // }
}

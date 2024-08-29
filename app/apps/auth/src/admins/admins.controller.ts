import { Controller } from '@nestjs/common';
import { AdminsService } from './admins.service';
import {
  AdminServiceController,
  AdminServiceControllerMethods, CreateAdminDto, FindOneDto, ForgotPasswordDto,
  LoginDto, LogoutDto, RefreshTokenDto, ResetPasswordDto,
  UpdateAdminEmailDto,
  UpdateAdminPasswordDto,
} from '@app/common';

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

  updateAdminEmail(updateAdminEmailDto: UpdateAdminEmailDto) {
    return this.adminsService.updateAdminEmail(updateAdminEmailDto.id, updateAdminEmailDto);
  }

  updateAdminPassword(updateAdminPassDto: UpdateAdminPasswordDto) {
    return this.adminsService.updateAdminPassword(updateAdminPassDto.id ,updateAdminPassDto);
  }

  logoutAdmin(logoutDto: LogoutDto) {
    return this.adminsService.logoutAdmin(logoutDto.refreshToken);
  }

  adminRefreshToken(refreshTokenDto: RefreshTokenDto) {
    return this.adminsService.adminRefreshToken(refreshTokenDto.refreshToken);
  }

  adminForgotPassword(forgotPassDto: ForgotPasswordDto) {
    return this.adminsService.adminForgotPassword(forgotPassDto.email);
  }

  adminResetPassword(resetPasswordDto: ResetPasswordDto) {
    return this.adminsService.adminResetPassword(resetPasswordDto);
  }

  removeAdmin(findOneDto: FindOneDto) {
    return this.adminsService.remove(findOneDto.id);
  }
}

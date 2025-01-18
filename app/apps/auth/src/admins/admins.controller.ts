import { Controller } from '@nestjs/common';
import { AdminsService } from './admins.service';
import {
  AdminServiceController,
  AdminServiceControllerMethods, BaseResponse,
  FindOneDto, RequestUpdateAdminProfile,
  RequestUpdateEmailRequest, RequestUpdateProfile, ResetPasswordRequest,
  UpdateAdminRoleRequest,
  UpdateEmailRequest,
  UpdatePasswordRequest,
  VerifyEmailCodeRequest,
} from '@app/common';
import { CreateAdminDto, LoginDto, RefreshTokenDto, ForgotPasswordDto } from '@app/common/dtos/auth-dtos';
import { Observable } from 'rxjs';
import { AuthConstants } from '../constants';
import { UpdateUserProfileDto } from '@app/common/dtos';

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

  findOne(findOneDto: FindOneDto) {
    console.log('findOneAdmin received:', findOneDto);
    return this.adminsService.FindAdmin(findOneDto);
  }

  permissionsByRole(findOneDto: FindOneDto) {
    console.log('findOneAdmin received IN permissionsByRole:', findOneDto);
    return this.adminsService.GetPermissionsByRole(findOneDto);
  }

  getAllAdmins() {
    return this.adminsService.getAllAdmins();
  }

  updateAdminProfile(requestUpdateProfile : RequestUpdateAdminProfile): Observable<BaseResponse> {
    const { adminProfileUpdateDto, findOneDto } = requestUpdateProfile
    return this.adminsService.updateAdminProfile(adminProfileUpdateDto, findOneDto);
  }

  deleteAdminProfile(findOneDto: FindOneDto) {
    return this.adminsService.deleteAdminProfile(findOneDto);
  }
}

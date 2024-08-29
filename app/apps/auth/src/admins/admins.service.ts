import { Injectable } from '@nestjs/common';
import { CreateAdminDto, LoginDto, ResetPasswordDto, UpdateAdminEmailDto, UpdateAdminPasswordDto } from '@app/common';

@Injectable()
export class AdminsService {
  create(createUserDto: CreateAdminDto) {
    return 'This action adds a new user';
  }

  adminLogin(loginRequest: LoginDto) {
    return `This action logs in users`;
  }

  updateAdminPassword(id: string, updatePasswordDto: UpdateAdminPasswordDto) {
    return `This action updates user password a #${id, updatePasswordDto}`;
  }

  updateAdminEmail(id: string, updateEmailDto: UpdateAdminEmailDto) {
    return `This action updates user password a #${id, updateEmailDto}`;
  }

  logoutAdmin(refreshToken: string) {
    return `This action updates a #${refreshToken} user`;
  }

  adminRefreshToken(refreshToken: string) {
    return `This action updates a #${refreshToken} admin`;
  }

  adminForgotPassword(email: string) {
    return `This action updates a #${email} admin`;
  }

  adminResetPassword(resetPasswordDto: ResetPasswordDto) {
    return `This action updates a #${resetPasswordDto} admin`;
  }

  remove(id: string) {
    return `This action removes a #${id} admin`;
  }
}

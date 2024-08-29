import { Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  LoginDto,
  ResetPasswordDto,
  UpdateUserEmailDto,
  UpdateUserPasswordDto,
} from '@app/common';

@Injectable()
export class UsersService {

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  login(loginRequest: LoginDto) {
    return `This action logs in users`;
  }

  updateUserPass(id: string, updatePasswordDto: UpdateUserPasswordDto) {
    return `This action updates user password a #${id, updatePasswordDto}`;
  }

  updateUserEmail(id: string, updateEmailDto: UpdateUserEmailDto) {
    return `This action updates user password a #${id, updateEmailDto}`;
  }

  logoutUser(refreshToken: string) {
    return `This action updates a #${refreshToken} user`;
  }

  userRefreshToken(refreshToken: string) {
    return `This action updates a #${refreshToken} user`;
  }

  userForgotPassword(email: string) {
    return `This action updates a #${email} user`;
  }

  userResetPassword(resetPasswordDto: ResetPasswordDto) {
    return `This action updates a #${resetPasswordDto} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}

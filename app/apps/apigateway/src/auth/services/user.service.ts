import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  CreateUserDto, ForgotPasswordDto,
  LoginDto, LogoutDto, RefreshTokenDto, ResetPasswordDto,
  UpdateUserEmailDto,
  UpdateUserPasswordDto,
  USER_SERVICE_NAME,
  UserServiceClient,
} from '@app/common';
import { ClientGrpc } from '@nestjs/microservices';
import { AUTH_SERVICE } from '../constants';


@Injectable()
export class UserService implements OnModuleInit {
  private userService: UserServiceClient;

  constructor(@Inject(AUTH_SERVICE) private client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<UserServiceClient>(USER_SERVICE_NAME)
  }

  create(createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto)
  }

  login(loginRequest: LoginDto) {
    return this.userService.userLogin(loginRequest);
  }

  updatePassword(id: string, updatePasswordDto: UpdateUserPasswordDto) {
    return this.userService.updateUserPassword({id, ...updatePasswordDto});
  }

  updateEmail(id: string, updateEmailDto: UpdateUserEmailDto) {
    return this.userService.updateUserEmail({id, ...updateEmailDto});
  }

  logout(logoutDto: LogoutDto){
    return this.userService.logoutUser(logoutDto);
  }

  refreshToken(refreshTokenDto: RefreshTokenDto){
    return this.userService.userRefreshToken(refreshTokenDto)
  }

  forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    return this.userService.userForgotPassword(forgotPasswordDto)
  }

  resetPassword(resetPasswordDto: ResetPasswordDto) {
    return this.userService.userResetPassword(resetPasswordDto)
  }

  remove(id: string) {
    return this.userService.removeUser({ id });
  }
}

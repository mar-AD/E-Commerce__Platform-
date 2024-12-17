import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  CreateUserDto,
  FindOneDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RequestUpdateEmailRequest,
  ResetPasswordRequest,
  UpdateEmailRequest,
  UpdatePasswordRequest,
  USER_SERVICE_NAME,
  UserServiceClient,
  VerifyEmailCodeRequest,
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

  updatePassword(updatePasswordDto: UpdatePasswordRequest) {
    return this.userService.updateUserPassword(updatePasswordDto);
  }

  RequestEmailUpdate(requestEmailUpdateDto:RequestUpdateEmailRequest) {
    return this.userService.requestUpdateUserEmail(requestEmailUpdateDto)
  }

  verifyEmailCode(verifyEmailCodeRequest: VerifyEmailCodeRequest) {
    return this.userService.verifyEmailCode(verifyEmailCodeRequest)
  }

  updateEmail(updateEmailRequest: UpdateEmailRequest) {
    return this.userService.updateUserEmail(updateEmailRequest);
  }

  logout(logoutDto: RefreshTokenDto){
    return this.userService.logoutUser(logoutDto);
  }

  refreshToken(refreshTokenDto: RefreshTokenDto){
    return this.userService.userRefreshToken(refreshTokenDto)
  }

  forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    return this.userService.userForgotPassword(forgotPasswordDto)
  }

  resetPassword(resetPasswordRequest: ResetPasswordRequest) {
    return this.userService.userResetPassword(resetPasswordRequest)
  }

  remove(findOneDto: FindOneDto) {
    return this.userService.removeUser(findOneDto);
  }

  // getUser(findOneDto: FindOneDto) {
  //   return this.userService.findUser(findOneDto);
  // }
}

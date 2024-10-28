import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  CreateUserDto, FindOneDto, ForgotPasswordDto,
  LoginDto, RefreshTokenDto, RequestEmailUpdateDto, ResetPasswordDto, TokenDto,
  UpdateEmailDto,
  UpdatePasswordDto,
  USER_SERVICE_NAME,
  UserServiceClient, VerifyEmailCodeDto,
} from '@app/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
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

  updatePassword(updatePasswordDto: UpdatePasswordDto, findOnsDto: FindOneDto) {
    return this.userService.updateUserPassword(updatePasswordDto, findOnsDto);
  }

  RequestEmailUpdate(requestEmailUpdateDto:RequestEmailUpdateDto, findOnsDto: FindOneDto) {
    return this.userService.requestUpdateUserEmail(requestEmailUpdateDto, findOnsDto)
  }

  verifyEmailCode(verifyEmailCodeDto: VerifyEmailCodeDto, findOnsDto: FindOneDto) {
    return this.userService.verifyEmailCode(verifyEmailCodeDto, findOnsDto)
  }

  updateEmail(updateEmailDto: UpdateEmailDto, findOnsDto: FindOneDto) {
    return this.userService.updateUserEmail(updateEmailDto, findOnsDto);
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

  resetPassword(resetPasswordDto: ResetPasswordDto, tokenDto: TokenDto) {
    return this.userService.userResetPassword(resetPasswordDto, tokenDto)
  }

  remove(findOneDto: FindOneDto) {
    return this.userService.removeUser(findOneDto);
  }
}

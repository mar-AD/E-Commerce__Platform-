import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  CreateUserDto, FindOneDto, ForgotPasswordDto,
  LoginDto, RefreshTokenDto, RequestEmailUpdateDto, ResetPasswordDto,
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
    try {
      return this.userService.userLogin(loginRequest);

    } catch (error) {
      // Ensure RpcException is thrown correctly
      if (error instanceof RpcException) {
        throw error; // Propagate RpcException
      }
      // For any other error, throw a new RpcException
      throw new RpcException({
        code: 500,
        message: 'An unknown error occurred',
      });
    }
  }

  updatePassword(updatePasswordDto: UpdatePasswordDto) {
    return this.userService.updateUserPassword(updatePasswordDto);
  }

  RequestEmailUpdate(requestEmailUpdateDto:RequestEmailUpdateDto) {
    return this.userService.requestUpdateUserEmail(requestEmailUpdateDto)
  }

  verifyEmailCode(verifyEmailCodeDto: VerifyEmailCodeDto) {
    return this.userService.verifyEmailCode(verifyEmailCodeDto)
  }

  updateEmail(updateEmailDto: UpdateEmailDto) {
    return this.userService.updateUserEmail(updateEmailDto);
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

  resetPassword(resetPasswordDto: ResetPasswordDto) {
    return this.userService.userResetPassword(resetPasswordDto)
  }

  remove(findOneDto: FindOneDto) {
    return this.userService.removeUser(findOneDto);
  }
}

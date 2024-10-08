import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateDto,
  FindOneDto, ForgotPasswordDto, LoginDto, RefreshTokenDto, RequestEmailUpdateDto, UpdateEmailDto, UpdatePasswordDto,
  UserServiceController,
  UserServiceControllerMethods, VerifyEmailCodeDto,
} from '@app/common';

@Controller()
@UserServiceControllerMethods()
export class UsersController implements UserServiceController{
  constructor(private readonly usersService: UsersService) {}

  createUser(createUserDto: CreateDto) {
    return this.usersService.createUser(createUserDto);
  }

  userLogin(loginRequest: LoginDto){
    return this.usersService.userLogin(loginRequest);
  }

  updateUserPassword(updatePasswordDto: UpdatePasswordDto) {
    return this.usersService.updateUserPassword(updatePasswordDto);
  }

  requestUpdateUserEmail (requestUpdateUserEmail: RequestEmailUpdateDto){
    return this.usersService.requestUpdateEmail(requestUpdateUserEmail)
  }

  verifyEmailCode (verifyEmailCodeDto: VerifyEmailCodeDto){
    return this.usersService.verifyEmailCode(verifyEmailCodeDto)
  }

  updateUserEmail(updateEmailDto: UpdateEmailDto) {
    return this.usersService.updateUserEmail(updateEmailDto);
  }

  logoutUser(logoutDto: RefreshTokenDto) {
    return this.usersService.logoutUser(logoutDto);
  }

  userRefreshToken(refreshTokenDto: RefreshTokenDto) {
    return this.usersService.userRefreshToken(refreshTokenDto);
  }
  //
  // userForgotPassword(forgotPassDto: ForgotPasswordDto ) {
  //   return this.usersService.userForgotPassword(forgotPassDto.email);
  // }
  //
  // userResetPassword(resetPasswordDto: ResetPasswordDto) {
  //   return this.usersService.userResetPassword(resetPasswordDto);
  // }
  //
  // removeUser(findOneDto: FindOneDto) {
  //   return this.usersService.remove(findOneDto.id);
  // }
}

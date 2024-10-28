import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  FindOneDto,
  LoginDto, RefreshTokenDto, RequestEmailUpdateDto, TokenDto, UpdateEmailDto, UpdatePasswordDto,
  UserServiceController,
  UserServiceControllerMethods, VerifyEmailCodeDto,
} from '@app/common';
import { CreateDto, ForgotPasswordDto, ResetPasswordDto } from '@app/common/dtos';

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

  updateUserPassword(updatePasswordDto: UpdatePasswordDto, findOneDto: FindOneDto) {
    return this.usersService.updateUserPassword(updatePasswordDto, findOneDto);
  }

  requestUpdateUserEmail (requestUpdateUserEmail: RequestEmailUpdateDto, findOneDto: FindOneDto){
    return this.usersService.requestUpdateEmail(requestUpdateUserEmail, findOneDto)
  }

  verifyEmailCode (verifyEmailCodeDto: VerifyEmailCodeDto, findOneDto: FindOneDto){
    return this.usersService.verifyEmailCode(verifyEmailCodeDto, findOneDto);
  }

  updateUserEmail(updateEmailDto: UpdateEmailDto, findOneDto: FindOneDto) {
    return this.usersService.updateUserEmail(updateEmailDto, findOneDto);
  }

  logoutUser(logoutDto: RefreshTokenDto) {
    return this.usersService.logoutUser(logoutDto);
  }

  userRefreshToken(refreshTokenDto: RefreshTokenDto) {
    return this.usersService.userRefreshToken(refreshTokenDto);
  }

  userForgotPassword(forgotPassDto: ForgotPasswordDto ) {
    return this.usersService.userForgotPassword(forgotPassDto);
  }

  userResetPassword(resetPasswordDto: ResetPasswordDto, tokenDto: TokenDto) {
    return this.usersService.userResetPassword(resetPasswordDto, tokenDto);
  }

  removeUser(findOneDto: FindOneDto) {
    return this.usersService.deleteUser(findOneDto);
  }
}

import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  FindOneDto, ForgotPasswordDto, RequestEmailUpdateDto,
  UserServiceController,
  UserServiceControllerMethods, VerifyEmailCodeDto,
} from '@app/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto, RefreshTokenDto, UpdateEmailDto, UpdatePasswordDto } from '@app/common/dtos';

@Controller()
@UserServiceControllerMethods()
export class UsersController implements UserServiceController{
  constructor(private readonly usersService: UsersService) {}

  createUser(createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  userLogin(loginRequest: LoginDto){
    return this.usersService.login(loginRequest);
  }

  updateUserPassword(updatePasswordDto: UpdatePasswordDto) {
    return this.usersService.updateUserPass(updatePasswordDto);
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

  // userRefreshToken(refreshTokenDto: RefreshTokenDto) {
  //   return this.usersService.userRefreshToken(refreshTokenDto.refreshToken);
  // }
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

import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  FindOneDto, ForgotPasswordDto,
  LogoutDto, RefreshTokenDto, ResetPasswordDto, UpdateUserEmailDto,
  UpdateUserPasswordDto, User,
  UserServiceController,
  UserServiceControllerMethods,
} from '@app/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Observable } from 'rxjs';
import { LoginUserDto } from './dto/login-user.dto';

@Controller()
@UserServiceControllerMethods()
export class UsersController implements UserServiceController{
  constructor(private readonly usersService: UsersService) {}

  createUser(createUserDto: CreateUserDto): Observable<User> {
    return this.usersService.create(createUserDto);
  }

  userLogin(loginRequest: LoginUserDto) {
    return this.usersService.login(loginRequest);
  }
  //
  // updateUserPassword(updatePasswordDto: UpdateUserPasswordDto) {
  //   return this.usersService.updateUserPass(updatePasswordDto.id, updatePasswordDto);
  // }
  //
  // updateUserEmail(updateEmailDto: UpdateUserEmailDto) {
  //   return this.usersService.updateUserEmail(updateEmailDto.id, updateEmailDto);
  // }
  //
  // logoutUser(logoutDto: LogoutDto) {
  //   return this.usersService.logoutUser(logoutDto.refreshToken);
  // }
  //
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

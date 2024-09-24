import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from '../services/user.service';
import {
  ForgotPasswordDto,
  LoginDto,
  LogoutDto,
  RefreshTokenDto, ResetPasswordDto,
  UpdateUserEmailDto,
  UpdateUserPasswordDto,
} from '@app/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../../../../auth/src/users/dto/create-user.dto';


@ApiTags('AuthUsers')
@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('user/register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('user/login')
  userLogin(@Body() loginRequest: LoginDto) {
    return this.userService.login(loginRequest);
  }

  @Patch('userPassUpdate/:id')
  updateUserPassword(@Param('id') id: string, @Body() updatePasswordDto: UpdateUserPasswordDto) {
    return this.userService.updatePassword(id, updatePasswordDto);
  }

  @Patch('userEmailUpdate/:id')
  updateUserEmail(@Param('id') id: string, @Body() updateEmailDto: UpdateUserEmailDto) {
    return this.userService.updateEmail(id, updateEmailDto);
  }

  @Post('user/logout')
  logoutUser(@Body() logoutDto: LogoutDto) {
    return this.userService.logout(logoutDto);
  }

  @Post('user/refresh-token')
  userRefreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.userService.refreshToken(refreshTokenDto);
  }

  @Post('user/forgot-password')
  userForgotPassword(@Body() forgotPassDto: ForgotPasswordDto) {
    return this.userService.forgotPassword(forgotPassDto);
  }

  @Post('user/reset-password')
  userResetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.userService.resetPassword(resetPasswordDto);
  }

  @Delete('user/:id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}

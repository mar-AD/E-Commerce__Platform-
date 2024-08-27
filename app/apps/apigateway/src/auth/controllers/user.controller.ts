import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from '../services/user.service';
import {
  CreateUserDto, ForgotPasswordDto,
  LoginDto,
  LogoutDto,
  RefreshTokenDto, ResetPasswordDto,
  UpdateUserEmailDto,
  UpdateUserPasswordDto,
} from '@app/common';


@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post()
  userLogin(@Body() loginRequest: LoginDto) {
    return this.userService.login(loginRequest);
  }

  @Patch(':id')
  updateUserPassword(@Param('id') id: string, @Body() updatePasswordDto: UpdateUserPasswordDto) {
    return this.userService.updatePassword(id, updatePasswordDto);
  }

  @Patch(':id')
  updateUserEmail(@Param('id') id: string, @Body() updateEmailDto: UpdateUserEmailDto) {
    return this.userService.updateEmail(id, updateEmailDto);
  }

  @Post()
  logoutUser(@Body() logoutDto: LogoutDto) {
    return this.userService.logout(logoutDto);
  }

  @Post('refresh-token')
  userRefreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.userService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('forgot-password')
  userForgotPassword(@Body() forgotPassDto: ForgotPasswordDto) {
    return this.userService.forgotPassword(forgotPassDto.email);
  }

  @Post('reset-password')
  userResetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.userService.resetPassword(resetPasswordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}

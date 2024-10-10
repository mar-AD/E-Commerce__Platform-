import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ValidationPipe } from '@nestjs/common';
import { UserService } from '../services/user.service';
import {
  CreateUserDto, FindOneDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto, ResetPasswordDto,
  UpdateEmailDto,
  UpdatePasswordDto,
} from '@app/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';


@ApiTags('AuthUsers')
@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('user/register')
  createUser(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('user/login')
  userLogin(@Body(ValidationPipe) loginRequest: LoginDto) {
    return this.userService.login(loginRequest);
  }

  @Patch('userPassUpdate')
  updateUserPassword(@Req() req: Request, @Body(ValidationPipe) updatePasswordDto: UpdatePasswordDto) {
    updatePasswordDto.id = req['payload'].id
    return this.userService.updatePassword(updatePasswordDto);
  }

  @Patch('userEmailUpdate')
  updateUserEmail(@Req() req: Request, @Body(ValidationPipe) updateEmailDto: UpdateEmailDto) {
    updateEmailDto.id = req['payload'].id
    return this.userService.updateEmail(updateEmailDto);
  }

  @Post('user/logout')
  logoutUser(@Body(ValidationPipe) logoutDto: RefreshTokenDto) {
    return this.userService.logout(logoutDto);
  }

  @Post('user/refresh-token')
  userRefreshToken(@Body(ValidationPipe) refreshTokenDto: RefreshTokenDto) {
    return this.userService.refreshToken(refreshTokenDto);
  }

  @Post('user/forgot-password')
  userForgotPassword(@Body(ValidationPipe) forgotPassDto: ForgotPasswordDto) {
    return this.userService.forgotPassword(forgotPassDto);
  }

  @Post('user/reset-password/token')
  userResetPassword(@Param('token') token: string, @Body(ValidationPipe) resetPasswordDto: ResetPasswordDto) {
    resetPasswordDto.token = token;
    return this.userService.resetPassword(resetPasswordDto);
  }

  @Delete('user/remove')
  remove(@Req() req: Request, @Body(ValidationPipe) findOneDto: FindOneDto) {
    findOneDto.id = req['payload'].id
    return this.userService.remove(findOneDto);
  }
}

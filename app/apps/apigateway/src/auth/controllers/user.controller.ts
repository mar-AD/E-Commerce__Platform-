import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ValidationPipe } from '@nestjs/common';
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
  updateUserPassword(@Req() req: Request, @Body(ValidationPipe) updatePasswordDto: UpdateUserPasswordDto) {
    updatePasswordDto.id = req['payload'].id
    return this.userService.updatePassword(updatePasswordDto);
  }

  @Patch('userEmailUpdate')
  updateUserEmail(@Req() req: Request, @Body(ValidationPipe) updateEmailDto: UpdateUserEmailDto) {
    updateEmailDto.id = req['payload'].id
    return this.userService.updateEmail(updateEmailDto);
  }

  @Post('user/logout')
  logoutUser(@Body(ValidationPipe) logoutDto: LogoutDto) {
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

  @Post('user/reset-password')
  userResetPassword(@Body(ValidationPipe) resetPasswordDto: ResetPasswordDto) {
    return this.userService.resetPassword(resetPasswordDto);
  }

  @Delete('user/:id')
  remove(@Req() req: Request) {
    const {id} = req['payload']
    return this.userService.remove(id);
  }
}

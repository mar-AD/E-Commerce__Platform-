import { Controller, Post, Body, Patch, Param, Delete, Req, ValidationPipe, Get } from '@nestjs/common';
import { UserService } from '../services/user.service';
import {
  CreateDto, FindOneDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto, RequestEmailUpdateDto, ResetPasswordDto,
  UpdateEmailDto,
  UpdatePasswordDto, VerifyEmailCodeDto,
} from '@app/common/dtos' ;
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';


@ApiTags('AuthUsers')
@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('user/register')
  createUser(@Body(ValidationPipe) createUserDto: CreateDto) {
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

  @Post('user/requestEmailUpdate')
  RequestAdminEmailUpdate(@Req() req: Request, @Body() requestAdminEmailUpdate: RequestEmailUpdateDto) {
    requestAdminEmailUpdate.id = req['payload'].id;
    return this.userService.RequestEmailUpdate(requestAdminEmailUpdate)
  }

  @Get('user/verifyEmailCode')
  verifyEmailCode(@Req() req: Request, @Body() verifyEmailCodeDto: VerifyEmailCodeDto) {
    verifyEmailCodeDto.id = req['payload'].id;
    return this.userService.verifyEmailCode(verifyEmailCodeDto)
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

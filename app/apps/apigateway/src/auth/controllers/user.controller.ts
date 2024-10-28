import { Controller, Post, Body, Patch, Param, Delete, Req, Get } from '@nestjs/common';
import { UserService } from '../services/user.service';
import {
  CreateDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto, RequestEmailUpdateDto, ResetPasswordDto,
  UpdateEmailDto,
  UpdatePasswordDto, VerifyEmailCodeDto,
} from '@app/common/dtos' ;
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { FindOneDto, TokenDto } from '@app/common';


@ApiTags('AuthUsers')
@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('user/register')
  createUser(@Body() createUserDto: CreateDto) {
    return this.userService.create(createUserDto);
  }

  @Post('user/login')
  userLogin(@Body() loginRequest: LoginDto) {
    return this.userService.login(loginRequest);
  }

  @Patch('userPassUpdate')
  updateUserPassword(@Req() req: Request, @Body() updatePasswordDto: UpdatePasswordDto) {
    const id = req['payload'].id
    const findOnsDto : FindOneDto = {id};
    return this.userService.updatePassword(updatePasswordDto, findOnsDto);
  }

  @Post('user/requestEmailUpdate')
  RequestAdminEmailUpdate(@Req() req: Request, @Body() requestAdminEmailUpdate: RequestEmailUpdateDto) {
    const id = req['payload'].id
    const findOnsDto : FindOneDto = {id};
    return this.userService.RequestEmailUpdate(requestAdminEmailUpdate, findOnsDto)
  }

  @Get('user/verifyEmailCode')
  verifyEmailCode(@Req() req: Request, @Body() verifyEmailCodeDto: VerifyEmailCodeDto) {
    const id = req['payload'].id
    const findOnsDto : FindOneDto = {id};
    return this.userService.verifyEmailCode(verifyEmailCodeDto, findOnsDto)
  }

  @Patch('userEmailUpdate')
  updateUserEmail(@Req() req: Request, @Body() updateEmailDto: UpdateEmailDto) {
    const id = req['payload'].id
    const findOnsDto : FindOneDto = {id};
    return this.userService.updateEmail(updateEmailDto, findOnsDto);
  }

  @Post('user/logout')
  logoutUser(@Body() logoutDto: RefreshTokenDto) {
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

  @Post('user/reset-password/token')
  userResetPassword(@Param('token') token: string, @Body() resetPasswordDto: ResetPasswordDto) {
    const tokenDto : TokenDto = { token };
    return this.userService.resetPassword(resetPasswordDto, tokenDto);
  }

  @Delete('user/remove')
  remove(@Req() req: Request) {
    const id = req['payload'].id
    const findOneDto : FindOneDto = {id};
    return this.userService.remove(findOneDto);
  }
}

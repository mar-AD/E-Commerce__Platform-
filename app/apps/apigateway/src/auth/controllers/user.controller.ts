import { Controller, Post, Body, Patch, Param, Delete, Req, Get, UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import {
  CreateDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto, RequestEmailUpdateDto, ResetPasswordDto,
  UpdateEmailDto,
  UpdatePasswordDto, VerifyEmailCodeDto,
} from '@app/common/dtos' ;
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  FindOneDto, getPermissionName, Permissions, PermissionsGuard,
  RequestUpdateEmailRequest,
  ResetPasswordRequest,
  TokenDto,
  UpdateEmailRequest, UpdatePasswordRequest,
  VerifyEmailCodeRequest,
} from '@app/common';
import { PermissionsAndAccess } from '@app/common/utils/methadata';
import { AuthGuard } from '@nestjs/passport';


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
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['user'] })
  updateUserPassword(@Req() req: Request, @Body() updatePasswordDto: UpdatePasswordDto) {
    const id = req['payload'].id
    const findOneDto : FindOneDto = {id};
    const updatePasswordRequest: UpdatePasswordRequest = { updatePasswordDto, findOneDto}
    return this.userService.updatePassword(updatePasswordRequest);
  }

  @Post('user/requestEmailUpdate')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['user'] })
  RequestAdminEmailUpdate(@Req() req: Request, @Body() requestEmailUpdateDto: RequestEmailUpdateDto) {
    const id = req['payload'].id
    const findOneDto : FindOneDto = {id};
    const requestUpdateEmailDto: RequestUpdateEmailRequest = {requestEmailUpdateDto, findOneDto}
    return this.userService.RequestEmailUpdate(requestUpdateEmailDto)
  }

  @Get('user/verifyEmailCode')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['user'] })
  verifyEmailCode(@Req() req: Request, @Body() verifyEmailCodeDto: VerifyEmailCodeDto) {
    const id = req['payload'].id
    const findOneDto : FindOneDto = {id};
    const verifyEmailCodeRequest: VerifyEmailCodeRequest = {verifyEmailCodeDto, findOneDto}
    return this.userService.verifyEmailCode(verifyEmailCodeRequest)
  }

  @Patch('userEmailUpdate')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['user'] })
  updateUserEmail(@Req() req: Request, @Body() updateEmailDto: UpdateEmailDto) {
    const id = req['payload'].id
    const findOneDto : FindOneDto = {id};
    const updateEmailRequest: UpdateEmailRequest = {updateEmailDto, findOneDto}
    return this.userService.updateEmail(updateEmailRequest);
  }

  @Post('user/logout')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['user'] })
  logoutUser(@Body() logoutDto: RefreshTokenDto) {
    return this.userService.logout(logoutDto);
  }

  @Post('user/refresh-token')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['user'] })
  userRefreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.userService.refreshToken(refreshTokenDto);
  }

  @Post('user/forgot-password')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['user'] })
  userForgotPassword(@Body() forgotPassDto: ForgotPasswordDto) {
    return this.userService.forgotPassword(forgotPassDto);
  }

  @Post('user/reset-password/token')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['user'] })
  userResetPassword(@Param('token') token: string, @Body() resetPasswordDto: ResetPasswordDto) {
    const tokenDto : TokenDto = { token };
    const resetPasswordRequest: ResetPasswordRequest = {resetPasswordDto, tokenDto}
    return this.userService.resetPassword(resetPasswordRequest);
  }

  @Delete('user/remove')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @ApiBearerAuth()
  @PermissionsAndAccess({ accessType: ['user'] })
  remove(@Req() req: Request) {
    const id = req['payload'].id
    const findOneDto : FindOneDto = {id};
    return this.userService.remove(findOneDto);
  }
}

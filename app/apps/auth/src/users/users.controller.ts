import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  FindOneDto,
  LoginDto,
  RefreshTokenDto,
  RequestUpdateEmailRequest, ResetPasswordRequest,
  UpdateEmailRequest,
  UpdatePasswordRequest,
  UserServiceController,
  UserServiceControllerMethods,
  VerifyEmailCodeRequest,
} from '@app/common';
import { CreateDto, ForgotPasswordDto } from '@app/common/dtos';
import { Client, ClientProxy, Transport } from '@nestjs/microservices';
import * as process from 'node:process';

@Controller()
@UserServiceControllerMethods()
export class UsersController implements UserServiceController{
  @Client({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://marra:password@rabbitmq:5672'],
      queue: 'email_queue',
      queueOptions: {
        durable: true,
      },
    },
  })
  private client: ClientProxy;
  constructor(private readonly usersService: UsersService) {}

  createUser(createUserDto: CreateDto) {
     const admin =this.usersService.createUser(createUserDto);
    this.client.emit('welcome_email', { email: createUserDto.email }).subscribe({
      next: () => {
        console.log('Message emitted successfully.');
      },
      error: (err) => {
        console.error('Message emission failed:', err);
      },
    });
    return admin;
  }

  userLogin(loginRequest: LoginDto){
    return this.usersService.userLogin(loginRequest);
  }

  updateUserPassword(updatePasswordRequest: UpdatePasswordRequest) {
    const {updatePasswordDto, findOneDto} = updatePasswordRequest;
    return this.usersService.updateUserPassword(updatePasswordDto, findOneDto);
  }

  requestUpdateUserEmail (requestUpdateEmailRequest: RequestUpdateEmailRequest){
    const {requestEmailUpdateDto, findOneDto } = requestUpdateEmailRequest;
    return this.usersService.requestUpdateEmail(requestEmailUpdateDto, findOneDto)
  }

  verifyEmailCode (verifyEmailCodeRequest : VerifyEmailCodeRequest){
    const {verifyEmailCodeDto, findOneDto} = verifyEmailCodeRequest;
    return this.usersService.verifyEmailCode(verifyEmailCodeDto, findOneDto);
  }

  updateUserEmail(updateEmailRequest: UpdateEmailRequest) {
    const {updateEmailDto, findOneDto} = updateEmailRequest;
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

  userResetPassword(resetPasswordRequest: ResetPasswordRequest) {
    const {resetPasswordDto, tokenDto} = resetPasswordRequest;
    return this.usersService.userResetPassword(resetPasswordDto, tokenDto);
  }

  removeUser(findOneDto: FindOneDto) {
    return this.usersService.deleteUser(findOneDto);
  }

  findUser(findOneDto: FindOneDto) {
    return this.usersService.getUser(findOneDto);
  }
}

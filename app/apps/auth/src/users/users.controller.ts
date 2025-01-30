import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  FindOneDto,
  LoginDto,
  RefreshTokenDto,
  RequestUpdateEmailRequest, RequestUpdateProfile, ResetPasswordRequest,
  UpdateEmailRequest,
  UpdatePasswordRequest,
  UserServiceController,
  UserServiceControllerMethods,
  VerifyEmailCodeRequest,
} from '@app/common';
import { CreateDto, ForgotPasswordDto } from '@app/common/dtos/auth-dtos';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller()
@UserServiceControllerMethods()
export class UsersController implements UserServiceController{
  constructor(
    private readonly usersService: UsersService,
  ) {}

  createUser(createUserDto: CreateDto) {
     return this.usersService.createUser(createUserDto);
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

  findOne(findOneDto: FindOneDto) {
    return this.usersService.getUser(findOneDto);
  }

  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  updateUserProfile(requestUpdateProfile : RequestUpdateProfile) {
    const { userProfileUpdateDto, findOneDto } = requestUpdateProfile
    return this.usersService.updateUserProfile(userProfileUpdateDto, findOneDto);
  }

  deleteUserProfile(findOneDto: FindOneDto) {
    return this.usersService.deleteUserProfile(findOneDto);
  }

  @MessagePattern('get_user_id')
  async findOneUser(@Payload() data: {id: string}, @Ctx() context: RmqContext ): Promise<boolean>{
    return this.usersService.getOneUser(data, context);
  }
}

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
import { CreateDto, ForgotPasswordDto } from '@app/common/dtos/auth-dtos';

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

  updateUserProfile(findOneDto: FindOneDto) {
    return this.usersService.updateUserProfile(findOneDto);
  }
}

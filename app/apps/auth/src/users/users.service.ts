import { Injectable } from '@nestjs/common';
import {
  AuthResponse, CreateDto,
  dateToTimestamp,
  Empty,
  JwtTokenService,
  LoginDto, RefreshTokenDto,
  RequestEmailUpdateDto, UpdateEmailDto,
  UpdatePasswordDto,
  User, VerifyEmailCodeDto,
} from '@app/common';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { AuthConstants } from '../constants';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { EmailVerificationCodeEntity } from '../entities/email-verification-code.entity';
import { BaseService } from '../auth.service';
import { AdminEntity } from '../admins/entities/admin.entity';

@Injectable()
export class UsersService extends BaseService<User>{

  constructor(
    @InjectRepository(UserEntity) protected readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserEntity) protected readonly adminRepository: Repository<AdminEntity>,
    @InjectRepository(RefreshTokenEntity) protected readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    @InjectRepository(EmailVerificationCodeEntity) protected readonly emailVerificationCodeRepository: Repository<EmailVerificationCodeEntity>,
    protected readonly jwtTokenService: JwtTokenService,
  ) {
    super(adminRepository, userRepository, refreshTokenRepository, emailVerificationCodeRepository, jwtTokenService)
  }

  createUser(createUserDto: CreateDto) : Observable<User> {
    return this.create(createUserDto, AuthConstants.user)
  }

  userLogin(loginRequest: LoginDto): Observable<AuthResponse> {
    return this.login(loginRequest, AuthConstants.user)
  }

  updateUserPassword(updatePasswordDto: UpdatePasswordDto):Observable<User> {
    return this.updatePassword(updatePasswordDto, AuthConstants.user)
  }

  requestUpdateEmail(requestEmailUpdateDto:RequestEmailUpdateDto):Observable<Empty>{
    return this.requestUpEmail(requestEmailUpdateDto, AuthConstants.user)
  }

  verifyEmailCode(verifyEmailCodeDto: VerifyEmailCodeDto): Observable<Empty>{
    return this.verifyCode(verifyEmailCodeDto, AuthConstants.user)
  }

  updateUserEmail(updateEmailDto: UpdateEmailDto):Observable<User> {
    return this.updateEmail(updateEmailDto, AuthConstants.user)
  }

  logoutUser(logoutDto: RefreshTokenDto):Observable<Empty> {
    return this.logout( logoutDto, AuthConstants.user)
  }

  userRefreshToken(refreshTokenDto: RefreshTokenDto): Observable<AuthResponse> {
    return this.refreshTokenAW(refreshTokenDto, AuthConstants.user)
  }
  // userForgotPassword(email: string) {
  //   return `This action updates a #${email} user`;
  // }
  //
  // userResetPassword(resetPasswordDto: ResetPasswordDto) {
  //   return `This action updates a #${resetPasswordDto} user`;
  // }
  //
  // remove(id: string) {
  //   return `This action removes a #${id} user`;
  // }

  mapResponse (user: UserEntity): User{
    return{
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      isDeleted: user.isDeleted,
      createdAt: dateToTimestamp(user.createdAt),
      updatedAt: dateToTimestamp(user.updatedAt),
      deletedAt: dateToTimestamp(user.deletedAt)
    }
  }
}



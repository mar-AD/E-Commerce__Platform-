import { Injectable } from '@nestjs/common';
import {
  AuthResponse,
  dateToTimestamp,
  Empty, CronService,
  JwtTokenService,
  User, LoggerService, FindOneDto, TokenDto, hashPassword, messages,
} from '@app/common';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { catchError, from, map, Observable, switchMap } from 'rxjs';
import { AuthConstants } from '../constants';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { EmailVerificationCodeEntity } from '../entities/email-verification-code.entity';
import { BaseService } from '../auth.service';
import { AdminEntity } from '../admins/entities/admin.entity';
import { CreateDto, ForgotPasswordDto, LoginDto, RefreshTokenDto, RequestEmailUpdateDto, ResetPasswordDto,
  UpdateEmailDto, UpdatePasswordDto, VerifyEmailCodeDto } from '@app/common/dtos';
import { Cron } from '@nestjs/schedule';


@Injectable()
export class UsersService extends BaseService<User>{

  constructor(
    @InjectRepository(UserEntity) protected readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AdminEntity) protected readonly adminRepository: Repository<AdminEntity>,
    @InjectRepository(RefreshTokenEntity) protected readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    @InjectRepository(EmailVerificationCodeEntity) protected readonly emailVerificationCodeRepository: Repository<EmailVerificationCodeEntity>,
    protected readonly jwtTokenService: JwtTokenService,
    private readonly cronService: CronService,
    protected readonly logger: LoggerService,
  ) {
    super(adminRepository, userRepository, refreshTokenRepository, emailVerificationCodeRepository, jwtTokenService, logger)
  }

  createUser(createUserDto: CreateDto) : Observable<User> {
    return this.create(null, createUserDto, AuthConstants.user)
  }

  userLogin(loginRequest: LoginDto): Observable<AuthResponse> {
    return this.login(loginRequest, AuthConstants.user)
  }

  updateUserPassword(updatePasswordDto: UpdatePasswordDto, findOneDto: FindOneDto):Observable<User> {
    return this.updatePassword(findOneDto, updatePasswordDto, AuthConstants.user)
  }

  requestUpdateEmail(requestEmailUpdateDto:RequestEmailUpdateDto, findOneDto: FindOneDto):Observable<Empty>{
    return this.requestUpEmail(findOneDto, requestEmailUpdateDto, AuthConstants.user)
  }

  verifyEmailCode(verifyEmailCodeDto: VerifyEmailCodeDto, findOneDto: FindOneDto): Observable<Empty>{
    return this.verifyCode(findOneDto, verifyEmailCodeDto, AuthConstants.user)
  }

  updateUserEmail(updateEmailDto: UpdateEmailDto, findOneDto: FindOneDto):Observable<User> {
    return this.updateEmail(findOneDto, updateEmailDto, AuthConstants.user)
  }

  logoutUser(logoutDto: RefreshTokenDto):Observable<Empty> {
    return this.logout( logoutDto, AuthConstants.user)
  }

  userRefreshToken(refreshTokenDto: RefreshTokenDto): Observable<AuthResponse> {
    return this.refreshTokenAW(refreshTokenDto, AuthConstants.user)
  }

  userForgotPassword(forgotPassDto: ForgotPasswordDto):Observable<Empty> {
    return this.forgotPassword(forgotPassDto, AuthConstants.user)
  }

  userResetPassword(resetPasswordDto: ResetPasswordDto, tokenDto: TokenDto) {
    return this.resetPassword(tokenDto, resetPasswordDto, AuthConstants.user);
  }

  deleteUser(findOneDto: FindOneDto): Observable<Empty> {
    return this.remove(findOneDto, AuthConstants.user);
  }

  @Cron("0 0 * * *")
  async hardDeleteUser (){
    await this.cronService.CleanUpJob(this.userRepository, 1)
  }

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



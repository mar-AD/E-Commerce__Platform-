import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import {
  AuthResponse,
  dateToTimestamp, Empty, generateEmailCode, getExpiryDate, hashPassword, JwtTokenService,
  messages,
  User, VerifyEmailCode, verifyPassword,
} from '@app/common';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthConstants } from '../constants';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { LoginDto, RefreshTokenDto, RequestEmailUpdateDto, UpdateEmailDto, UpdatePasswordDto, VerifyEmailCodeDto } from '@app/common/dtos';
import { EmailVerificationCodeEntity } from '../entities/email-verification-code.entity';
import { BaseService } from '../auth.service';

@Injectable()
export class UsersService extends BaseService<UserEntity>{

  constructor(
    @InjectRepository(UserEntity) protected readonly repository: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity) protected readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    @InjectRepository(EmailVerificationCodeEntity) protected readonly emailVerificationCodeRepository: Repository<EmailVerificationCodeEntity>,
    protected readonly jwtTokenService: JwtTokenService,
  ) {
    super(repository, refreshTokenRepository, emailVerificationCodeRepository, jwtTokenService)
  }

  create(createUserDto: CreateUserDto) : Observable<User> {
    const { email, password } = createUserDto;
    return from(this.repository.findOne({ where: { email } })).pipe(
      switchMap((user)=>{
        if(user){
          throw new BadRequestException({
            status: HttpStatus.BAD_REQUEST,
            message: `User with email: ${email} already exists.`,
          });
        }

        return hashPassword(password).pipe(
          switchMap((hashedPass)=>{
            createUserDto.password = hashedPass;

            const newUser = this.repository.create(createUserDto)
            return from(this.repository.save(newUser)).pipe(
              map((createdUser) => this.mapUserResponse(createdUser)),
              catchError(() => {
                throw new BadRequestException({
                  status: HttpStatus.INTERNAL_SERVER_ERROR,
                  message: messages.USER.FAILED_TO_CREATE_USER,
                });
              })
            )
          })
        )
      })
    )
  }

  login(loginRequest: LoginDto): Observable<AuthResponse> {
    const {email, password} = loginRequest
    return from(this.repository.findOne({where:{email: email, isDeleted: false}})).pipe(
      switchMap((thisUser) =>{
        if(!thisUser){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messages.USER.INVALID_CREDENTIALS
          })
        }

        return verifyPassword(password, thisUser.password).pipe(
          switchMap((isMatch)=>{
            if(!isMatch){
              throw new BadRequestException({
                status: HttpStatus.BAD_REQUEST,
                message: messages.PASSWORD.INVALID_PASSWORD
              })
            }
            const payload = {
              id: thisUser.id,
              type: AuthConstants.user
            }
            const accessToken = this.jwtTokenService.generateAccessToken(payload)
            const refreshToken = this.jwtTokenService.generateRefreshToken((payload))
            const saveRefToken = {
              token: refreshToken,
              expiresAt: getExpiryDate(15),
              user: thisUser
            }
            return from(this.refreshTokenRepository.save(saveRefToken)).pipe(
              switchMap((refToken)=>{
                if(!refToken){
                  throw new BadRequestException({
                    status: HttpStatus.BAD_REQUEST,
                    message: 'Failed to save refresh token'
                  })
                }
                return of({
                  accessToken : accessToken,
                  refreshToken : refreshToken,
                  result: {
                    message :messages.USER.USER_LOGIN_SUCCESSFUL,
                    status: HttpStatus.OK
                  }
                })
              })
            )
          })
        )
      })
    )
  }
  //
  updateUserPass(updatePasswordDto: UpdatePasswordDto):Observable<User> {
    const {password, newPassword, confirmPassword} = updatePasswordDto
    return from(this.repository.findOne({where:{id: updatePasswordDto.id, isDeleted: false}})).pipe(
      switchMap((thisUser)=>{
        if (!thisUser){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messages.USER.FAILED_TO_FETCH_USER_FOR_UPDATE
          })
        }
        return verifyPassword(password, thisUser.password).pipe(
          switchMap((isMatch)=>{
            if (!isMatch){
              throw new BadRequestException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: messages.PASSWORD.INVALID_PASSWORD
              })
            }
            if (newPassword !== confirmPassword){
              throw new BadRequestException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: messages.PASSWORD.PASSWORDS_DO_NOT_MATCH
              })
            }
            return hashPassword(newPassword).pipe(
              switchMap((hashedPass)=> {
                thisUser.password = hashedPass

                return from(this.repository.save(thisUser)).pipe(
                  map((updatedUser) => this.mapUserResponse(updatedUser)),
                  catchError(() => {
                    throw new BadRequestException({
                      status: HttpStatus.INTERNAL_SERVER_ERROR,
                      message: messages.USER.FAILED_TO_UPDATE_USER
                    })
                  })
                )
              })
            )
          })
        )
      })
    )
  }

  requestUpdateEmail(requestEmailUpdateDto:RequestEmailUpdateDto):Observable<Empty>{
    return from(this.repository.findOne({where:{id: requestEmailUpdateDto.id, isDeleted: false}})).pipe(
      switchMap((thisUser) =>{
        if (!thisUser){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messages.USER.NOT_FOUND
          })
        }
        requestEmailUpdateDto.email = thisUser.email
        const code = generateEmailCode()
        const expiredAt = getExpiryDate(0, 0, 5)
        return from(this.emailVerificationCodeRepository.save({user: {id: requestEmailUpdateDto.id }, code: code, expiresAt: expiredAt})).pipe(

          // SEND AN EMAIL THAT CONTAINS THIS CODE TO THIS ADMIN -----------------------------------------------

          map(() => {
            return {
              result: {
                message : messages.EMAIL.EMAIL_VERIFICATION_CODE_SENT_SUCCESSFULLY,
                status: HttpStatus.OK
              }
            }
          }),
          catchError((error) =>{
            throw new BadRequestException({
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              message: error.message
            })
          })
        )
      })
    )
  }

  verifyEmailCode(verifyEmailCodeDto: VerifyEmailCodeDto): Observable<Empty>{
    return from(this.repository.findOne({where: {id: verifyEmailCodeDto.id, isDeleted: false}})).pipe(
      switchMap((thisUser) =>{
        if (!thisUser){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messages.USER.NOT_FOUND
          })
        }
        return from(this.emailVerificationCodeRepository.findOne({where: {user: { id: verifyEmailCodeDto.id }, code: verifyEmailCodeDto.verificationCode}})).pipe(
          map((verificationCode)=>{
            if (!verificationCode){
              throw new BadRequestException({
                status: HttpStatus.NOT_FOUND,
                message: 'Verification code not found or invalid.'
              })
            }
            VerifyEmailCode(verificationCode.expiresAt);

            return {
              result:{
                status: HttpStatus.OK,
                message: 'The code was verified successfully'
              }
            }
          }),
          catchError((error)=>{
            throw new BadRequestException({
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              message: error.message
            })
          })
        )
      })
    )
  }

  updateUserEmail(updateEmailDto: UpdateEmailDto):Observable<User> {
    return from(this.repository.findOne({where: {id: updateEmailDto.id, isDeleted: false}})).pipe(
      switchMap((thisUser) =>{
        if (!thisUser){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messages.USER.NOT_FOUND
          })
        }
        thisUser.email = updateEmailDto.email

        return from(this.repository.save(thisUser)).pipe(
          map((updatedUser) => this.mapUserResponse(updatedUser)),
          catchError(()=>{
            throw new BadRequestException({
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              message: messages.EMAIL.FAILED_TO_UPDATE_EMAIL
            })
          })
        )
      })
    )
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

  mapUserResponse (user: UserEntity): User{
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



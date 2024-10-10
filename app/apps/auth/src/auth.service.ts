import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './users/entities/user.entity';
import { MoreThan, Repository } from 'typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { EmailVerificationCodeEntity } from './entities/email-verification-code.entity';
import {
  AuthResponse,
  Empty,
  generateEmailCode,
  getExpiryDate,
  hashPassword,
  JwtTokenService,
  messages,
  VerifyEmailCode,
  verifyPassword,
} from '@app/common';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { AuthConstants } from './constants';
import { AdminEntity } from './admins/entities/admin.entity';
import { CreateDto, FindOneDto, ForgotPasswordDto, LoginDto, RefreshTokenDto, RequestEmailUpdateDto,
  ResetPasswordDto,
  UpdateEmailDto, UpdatePasswordDto, VerifyEmailCodeDto } from '@app/common/dtos';

@Injectable()
export abstract class  BaseService<E> {
  protected constructor(
    @InjectRepository(UserEntity) protected readonly adminRepository: Repository<AdminEntity>,
    @InjectRepository(UserEntity) protected readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity) protected readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    @InjectRepository(EmailVerificationCodeEntity) protected readonly emailVerificationCodeRepository: Repository<EmailVerificationCodeEntity>,
    protected readonly jwtTokenService: JwtTokenService,
  ) {}

  create(createDto: CreateDto, type: AuthConstants) : Observable<E> {
    const {email, password } = createDto;

    const repository= this.getRepository(type);
    const messageType = this.getMessageType(type);

    return from(repository.findOne({ where: { email } })).pipe(
      switchMap((existingEntity)=>{
        if(existingEntity){
          throw new BadRequestException({
            status: HttpStatus.BAD_REQUEST,
            message: `${type} with email: ${email} already exists.`,
          });
        }

        return hashPassword(password).pipe(
          switchMap((hashedPass)=>{
            createDto.password = hashedPass;

            const newEntity = repository.create(createDto)
            return from(repository.save(newEntity)).pipe(

              //SEND WELCOMING EMAIL TO THIS ADMIN -------------------------------------


              map((createdUser) => this.mapResponse(createdUser)),
              catchError(() => {
                throw new BadRequestException({
                  status: HttpStatus.INTERNAL_SERVER_ERROR,
                  message: messageType.FAILED_TO_CREATE,
                });
              })
            )
          })
        )
      })
    )
  }

  login(loginRequest: LoginDto, type: AuthConstants): Observable<AuthResponse> {
    const {email, password} = loginRequest;
    // const repository = isAdmin ? this.adminRepository : this.userRepository;
    const repository = this.getRepository(type);
    const messageType = this.getMessageType(type)

    return from(repository.findOne({where: {email: email, isDeleted: false}})).pipe(
      switchMap((thisEntity) => {
        if(!thisEntity){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messageType.INVALID_CREDENTIALS
          })
        }
        return verifyPassword(password, thisEntity.password).pipe(
          switchMap((isMatch)=>{
            if (!isMatch) {
              throw new BadRequestException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: messageType.PASSWORD.INVALID_PASSWORD,
              });
            }
            const payload = {
              id: thisEntity.id,
              type: AuthConstants.admin
            }
            const accessToken = this.jwtTokenService.generateAccessToken(payload)
            const refreshToken = this.jwtTokenService.generateRefreshToken(payload)
            const saveRefToken = {
              token: refreshToken,
              expiresAt: getExpiryDate(15),
              admin: thisEntity
            }
            return from(this.refreshTokenRepository.save(saveRefToken)).pipe(
              switchMap((refToken) => {
                if(!refToken){
                  throw new BadRequestException({
                    status: HttpStatus.BAD_REQUEST,
                    message: messageType.TOKEN.FAILED_TO_SAVE_REF_TOKEN
                  })
                }
                return of(
                  {
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    result: {
                      message :messageType.LOGIN_SUCCESSFUL,
                      status: HttpStatus.OK
                    }
                  },
                );
              })
            )
          })
        )
      })
    )
  }

  updatePassword(updatePasswordDto: UpdatePasswordDto, type: AuthConstants):Observable<E> {
    const { password, newPassword, confirmPassword } = updatePasswordDto;
    const repository = this.getRepository(type);
    const messageType = this.getMessageType(type)

    return from(repository.findOne({where: {id: updatePasswordDto.id, isDeleted: false}})).pipe(
      switchMap((thisAdmin) =>{
        if(!thisAdmin){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messageType.FAILED_TO_FETCH_FOR_UPDATE
          })
        }
        return verifyPassword(password, thisAdmin.password).pipe(
          switchMap((isMatch)=>{
            if (!isMatch) {
              throw new BadRequestException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: messages.PASSWORD.INVALID_PASSWORD,
              });
            }
            if(newPassword !== confirmPassword){
              throw new BadRequestException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: messages.PASSWORD.PASSWORDS_DO_NOT_MATCH,
              });
            }
            return hashPassword(newPassword).pipe(
              switchMap((hashedPassword)=>{
                thisAdmin.password = hashedPassword

                return from(repository.save(thisAdmin)).pipe(
                  map((updatedAdmin)=> this.mapResponse(updatedAdmin)),
                  catchError(()=>{
                    throw new BadRequestException({
                      status: HttpStatus.INTERNAL_SERVER_ERROR,
                      message: messages.PASSWORD.FAILED_TO_UPDATE_PASSWORD
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

  requestUpEmail(requestEmailUpdateDto:RequestEmailUpdateDto, type: AuthConstants):Observable<Empty>{
    const code = generateEmailCode()
    const expiredAt = getExpiryDate(0, 0, 5)
    // const condition={ code: code, expiresAt: expiredAt }
    //
    // if (type === AuthConstants.admin){
    //   repository = this.adminRepository;
    //   messageType = messages.ADMIN;
    //   condition[AuthConstants.admin] = {id: requestEmailUpdateDto.id }
    // }else if(type === AuthConstants.user){
    //   repository = this.userRepository;
    //   messageType = messages.USER;
    //   condition[AuthConstants.user] = {id: requestEmailUpdateDto.id }
    // }
    const condition= this.getCondition(type,{ code: code, expiresAt: expiredAt }, {id: requestEmailUpdateDto.id });
    const repository = this.getRepository(type);
    const messageType = this.getMessageType(type);

    return from(repository.findOne({where:{id: requestEmailUpdateDto.id, isDeleted: false}})).pipe(
      switchMap((thisEntity) =>{
        if (!thisEntity){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messageType.FAILED_FETCH
          })
        }
        requestEmailUpdateDto.email = thisEntity.email

        return from(this.emailVerificationCodeRepository.save(condition)).pipe(

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

  verifyCode(verifyEmailCodeDto: VerifyEmailCodeDto, type: AuthConstants): Observable<Empty>{
    // const whereCondition = { code: verifyEmailCodeDto.verificationCode };
    //
    // if (type === AuthConstants.admin){
    //   repository = this.adminRepository;
    //   messageType = messages.ADMIN;
    //   whereCondition[AuthConstants.admin] = {id: verifyEmailCodeDto.id}
    // }else if(type === AuthConstants.user){
    //   repository = this.userRepository;
    //   messageType = messages.USER;
    //   whereCondition[AuthConstants.user] = {id: verifyEmailCodeDto.id}
    // }
    const whereCondition = this.getCondition(type, { code: verifyEmailCodeDto.verificationCode }, {id: verifyEmailCodeDto.id})
    const repository = this.getRepository(type)
    const messageType = this.getMessageType(type)

    return from(repository.findOne({where: {id: verifyEmailCodeDto.id, isDeleted: false}})).pipe(
      switchMap((thisEntity) =>{
        if (!thisEntity){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messageType.FAILED_FETCH
          })
        }
        return from(this.emailVerificationCodeRepository.findOne({where: whereCondition})).pipe(
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

  updateEmail(updateEmailDto: UpdateEmailDto, type: AuthConstants):Observable<E> {
    const repository = this.getRepository(type);
    const messageType = this.getMessageType(type)

    return from(repository.findOne({where: {id: updateEmailDto.id, isDeleted: false}})).pipe(
      switchMap((thisEntity) =>{
        if (!thisEntity){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messageType.FAILED_TO_FETCH_FOR_UPDATE
          })
        }
        thisEntity.email = updateEmailDto.email

        return from(repository.save(thisEntity)).pipe(
          map((updatedAdmin) => this.mapResponse(updatedAdmin)),
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

  refreshTokenAW(refreshTokenDto: RefreshTokenDto, type: AuthConstants): Observable<AuthResponse> {
    const {refreshToken} = refreshTokenDto;
    const {id} = this.jwtTokenService.decodeToken(refreshToken);
    // const whereCondition = { token: refreshToken, revoked: false }
    //
    // if (type === AuthConstants.user){
    //   whereCondition[AuthConstants.user] = {id: id, isDeleted: false}
    // }else if (type === AuthConstants.admin){
    //   whereCondition[AuthConstants.admin] = {id: id, isDeleted: false}
    // }
    const whereCondition = this.getCondition(type, { token: refreshToken, revoked: false }, {id: id, isDeleted: false})

    return from(this.refreshTokenRepository.findOne({where: whereCondition})).pipe(
      switchMap((refToken) => {
        if (!refToken){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messages.TOKEN.TOKEN_NOT_FOUND
          })
        }
        const currenTime = new Date();
        const expirationDate = refToken.expiresAt
        const timeLeft = expirationDate.getTime() - currenTime.getTime();
        const oneHourToExp = 60 * 60 * 1000;

        if (expirationDate <= currenTime){
          refToken.revoked = true;
          return from(this.refreshTokenRepository.save(refToken)).pipe(
            switchMap(() => {
              throw new BadRequestException({
                status: HttpStatus.UNAUTHORIZED,
                message: messages.TOKEN.REF_TOKEN_HAS_EXPIRED
              })
            })
          )
        }
        else if(timeLeft <= oneHourToExp){
          refToken.revoked = true;
          return from(this.refreshTokenRepository.save(refToken)).pipe(
            switchMap(() => {
              throw new BadRequestException({
                status: HttpStatus.UNAUTHORIZED,
                message: messages.TOKEN.REF_TOKEN_WILL_EXPIRE
              })
            })
          )
        }
        const newAccessToken = this.jwtTokenService.generateAccessToken({id: refToken[type].id, type: type})
        return of({
          refreshToken: refreshToken,
          accessToken: newAccessToken,
          result: {
            message :messages.TOKEN.TOKEN_GENERATED_SUCCESSFULLY,
            status: HttpStatus.OK
          }
        })
      })
    )
  }

  logout(logoutDto: RefreshTokenDto, type: AuthConstants):Observable<Empty> {
    const {refreshToken} = logoutDto;
    const {id} = this.jwtTokenService.decodeToken(refreshToken);

    // const whereConditions = { token: refreshToken, expiresAt: MoreThan(new Date()) }
    //
    // if (type === AuthConstants.user){
    //   whereConditions[AuthConstants.user] = {id: id, isDeleted: false}
    // }else if (type === AuthConstants.admin){
    //   whereConditions[AuthConstants.admin] = {id: id, isDeleted: false}
    // }

    const whereConditions = this.getCondition(type, { token: refreshToken, expiresAt: MoreThan(new Date()) }, {id: id, isDeleted: false})

    return from(this.refreshTokenRepository.findOne({where: whereConditions})).pipe(
      switchMap((refToken) =>{
        if (!refToken){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messages.TOKEN.TOKEN_NOT_FOUND
          })
        }
        {
          refToken.revoked = true;

          return from(this.refreshTokenRepository.save(refToken)).pipe(
            map(() => {
              return {
                result: {
                  status: HttpStatus.OK,
                  message: messages.TOKEN.REF_TOKEN_REVOKED_SUCCESSFULLY,
                },
              };
            }),
            catchError((error) => {
              throw new BadRequestException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
              });
            }),
          );
        }
      })
    )
  }

  forgotPassword(forgotPassDto: ForgotPasswordDto, type: AuthConstants): Observable<Empty> {
    const { email }=forgotPassDto;
    const repository = this.getRepository(type);
    const messageType = this.getMessageType(type);
    return from(repository.findOne({where: {email}})).pipe(
      map((thisEntity) => {
        if (!thisEntity){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messageType.NOT_FOUND
          })
        }
        const payload = {
          id: thisEntity.id,
          type: type
        };
        this.jwtTokenService.generateAccessToken(payload);
        // SEND EMAIL--WILL DO WHEN I CREATE THE EMAIL SERVICE ------------------------------
        return {
          result: {
            status: HttpStatus.OK,
            message: messages.EMAIL.RESET_PASS_EMAIL_SENT
          }
        }
      })
    )


  }

  resetPassword(resetPasswordDto: ResetPasswordDto, type: AuthConstants): Observable<Empty> {
    const { token, newPassword, confirmPassword } = resetPasswordDto;
    const repository = this.getRepository(type);
    const messageType = this.getMessageType(type);

    const {id} = this.jwtTokenService.decodeToken(token)

    return from(repository.findOne({where: {id: id}})).pipe(
      switchMap((thisEntity) =>{
        if (!thisEntity){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messageType.FAILED_TO_FETCH_FOR_UPDATE
          })
        }
        if(newPassword !== confirmPassword){
          throw new BadRequestException({
            status: HttpStatus.BAD_REQUEST,
            message: messages.PASSWORD.PASSWORDS_DO_NOT_MATCH,
          });
        }
        return hashPassword(newPassword).pipe(
          switchMap((hashedPass) =>{
            thisEntity.password = hashedPass

            return from(repository.save(thisEntity)).pipe(
              map(() => {
                return {
                  result: {
                    status: HttpStatus.OK,
                    message: messages.PASSWORD.PASSWORD_RESET_SUCCESSFULLY
                  }
                }
              }),
              catchError((error) => {
                throw new BadRequestException({
                  status: HttpStatus.INTERNAL_SERVER_ERROR,
                  message: messages.PASSWORD.FAILED_TO_RESET_PASSWORD
                })
              })
            )
          })
        )
      })
    )
  }

  remove(findOneDto: FindOneDto, type: AuthConstants): Observable<Empty> {
    const repository = this.getRepository(type);
    const messageType = this.getMessageType(type);

    return from(repository.findOne({where: {id: findOneDto.id}})).pipe(
      switchMap((thisEntity) => {
        if (!thisEntity) {
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messageType.FAILED_FETCH_FOR_REMOVAL
          })
        }
        thisEntity.isDeleted = true
        return from(repository.save(thisEntity)).pipe(
          switchMap(() =>{
            return from(repository.softRemove(thisEntity)).pipe(
              map(() => {
                return {
                  result: {
                    status: HttpStatus.OK,
                    message: messageType.REMOVED_SUCCESSFULLY
                  }
                }
              }),
              catchError((error) => {
                throw new BadRequestException({
                  status: HttpStatus.INTERNAL_SERVER_ERROR,
                  message: messageType.FAILED_REMOVE
                })
              })
            )
          }),
          catchError((error) => {
            throw new BadRequestException({
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              message: messageType.FAILED_REMOVE
            })
          })
        )
      }),
      catchError((error) => {
        throw new BadRequestException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: messageType.FAILED_REMOVE
        })
      })
    )
  }



  protected getRepository(type: AuthConstants): Repository<AdminEntity | UserEntity> {
    if (type === AuthConstants.admin) {
      return this.adminRepository;
    } else if (type === AuthConstants.user) {
      return this.userRepository;
    } else {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid type provided.',
      });
    }
  }

  protected getMessageType(type: AuthConstants): any {
    if (type === AuthConstants.admin) {
      return messages.ADMIN;
    } else if (type === AuthConstants.user) {
      return messages.USER;
    } else {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid type provided.',
      });
    }
  }

  protected getCondition (type: AuthConstants, condition: Record<string, any>, value: Object): Record<string, any> {
    if (type === AuthConstants.admin) {
      condition[AuthConstants.admin] = value
    }else if (type === AuthConstants.user) {
      condition[AuthConstants.user] = value
    }else{
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid type provided.',
      });
    }
    return condition
  }

  protected abstract mapResponse(entity: UserEntity | AdminEntity): E;
}
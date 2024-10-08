import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './users/entities/user.entity';
import { MoreThan, Repository } from 'typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { EmailVerificationCodeEntity } from './entities/email-verification-code.entity';
import {
  AuthResponse, CreateDto,
  Empty,
  generateEmailCode,
  getExpiryDate, hashPassword,
  JwtTokenService,
  LoginDto,
  messages,
  RefreshTokenDto,
  RequestEmailUpdateDto,
  UpdateEmailDto, UpdatePasswordDto, VerifyEmailCode, VerifyEmailCodeDto,
  verifyPassword,
} from '@app/common';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { AuthConstants } from './constants';
import { AdminEntity } from './admins/entities/admin.entity';

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

    let repository: Repository<AdminEntity | UserEntity>;
    let messageType: any;


    if (type === AuthConstants.admin) {
      repository = this.adminRepository;
      messageType = messages.ADMIN

    } else if (type === AuthConstants.user) {
      repository = this.userRepository;
      messageType = messages.USER
    } else {
      throw new BadRequestException('Invalid type');
    }
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
    let repository: Repository<UserEntity | AdminEntity>;
    let messages: any

    if (type === AuthConstants.admin) {
      repository = this.adminRepository;
      messages = messages.ADMIN

    } else if (type === AuthConstants.user) {
      repository = this.userRepository;
      messages = messages.USER
    } else {
      throw new BadRequestException('Invalid type');
    }
    return from(repository.findOne({where: {email: email, isDeleted: false}})).pipe(
      switchMap((thisEntity) => {
        if(!thisEntity){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messages.INVALID_CREDENTIALS
          })
        }
        return verifyPassword(password, thisEntity.password).pipe(
          switchMap((isMatch)=>{
            if (!isMatch) {
              throw new BadRequestException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: messages.PASSWORD.INVALID_PASSWORD,
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
                    message: messages.TOKEN.FAILED_TO_SAVE_REF_TOKEN
                  })
                }
                return of(
                  {
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    result: {
                      message :messages.LOGIN_SUCCESSFUL,
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
    let repository : Repository<AdminEntity | UserEntity>
    let messageType: any

    if(type === AuthConstants.admin) {
      repository = this.adminRepository;
      messageType = messages.ADMIN
    } else if(type === AuthConstants.user) {
      repository = this.userRepository;
      messageType = messages.USER
    }

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
    let repository: Repository<UserEntity | AdminEntity>
    let messageType: any;
    const code = generateEmailCode()
    const expiredAt = getExpiryDate(0, 0, 5)
    const condition={
      code: code,
      expiresAt: expiredAt
    }

    if (type === AuthConstants.admin){
      repository = this.adminRepository;
      messageType = messages.ADMIN;
      condition[AuthConstants.admin] = {id: requestEmailUpdateDto.id }
    }else if(type === AuthConstants.user){
      repository = this.userRepository;
      messageType = messages.USER;
      condition[AuthConstants.user] = {id: requestEmailUpdateDto.id }
    }
    return from(repository.findOne({where:{id: requestEmailUpdateDto.id, isDeleted: false}})).pipe(
      switchMap((thisEntity) =>{
        if (!thisEntity){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messageType.NOT_FOUND
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
    let repository: Repository<UserEntity | AdminEntity>;
    let messageType: any;
    const whereCondition = { code: verifyEmailCodeDto.verificationCode };

    if (type === AuthConstants.admin){
      repository = this.adminRepository;
      messageType = messages.ADMIN;
      whereCondition[AuthConstants.admin] = {id: verifyEmailCodeDto.id}
    }else if(type === AuthConstants.user){
      repository = this.userRepository;
      messageType = messages.USER;
      whereCondition[AuthConstants.user] = {id: verifyEmailCodeDto.id}
    }

    return from(repository.findOne({where: {id: verifyEmailCodeDto.id, isDeleted: false}})).pipe(
      switchMap((thisEntity) =>{
        if (!thisEntity){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messageType.NOT_FOUND
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
    let repository: Repository<UserEntity | AdminEntity>;
    let messageType: any;

    if (type === AuthConstants.admin){
      repository = this.adminRepository;
      messageType = messages.ADMIN;
    }else if(type === AuthConstants.user){
      repository = this.userRepository;
      messageType = messages.USER;
    }
    return from(repository.findOne({where: {id: updateEmailDto.id, isDeleted: false}})).pipe(
      switchMap((thisEntity) =>{
        if (!thisEntity){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messageType.NOT_FOUND
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
    const whereCondition = {
      token: refreshToken,
      revoked: false
    }

    if (type === AuthConstants.user){
      whereCondition[AuthConstants.user] = {id: id, isDeleted: false}
    }else if (type === AuthConstants.admin){
      whereCondition[AuthConstants.admin] = {id: id, isDeleted: false}
    }
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

    const whereConditions = {
      token: refreshToken,
      expiresAt: MoreThan(new Date())
    }

    if (type === AuthConstants.user){
      whereConditions[AuthConstants.user] = {id: id, isDeleted: false}
    }else if (type === AuthConstants.admin){
      whereConditions[AuthConstants.admin] = {id: id, isDeleted: false}
    }

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

  protected abstract mapResponse(entity: UserEntity | AdminEntity): E;
}
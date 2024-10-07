import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './users/entities/user.entity';
import { MoreThan, Repository } from 'typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { EmailVerificationCodeEntity } from './entities/email-verification-code.entity';
import {
  Admin,
  AuthResponse,
  dateToTimestamp,
  Empty, getExpiryDate,
  JwtTokenService, LoginDto,
  messages,
  RefreshTokenDto,
  UpdateEmailDto, verifyPassword,
} from '@app/common';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { AuthConstants } from './constants';
import { AdminEntity } from './admins/entities/admin.entity';

@Injectable()
export abstract class  BaseService<T, E> {
  protected constructor(
    @InjectRepository(UserEntity) protected readonly adminRepository: Repository<AdminEntity>,
    @InjectRepository(UserEntity) protected readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity) protected readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    @InjectRepository(EmailVerificationCodeEntity) protected readonly emailVerificationCodeRepository: Repository<EmailVerificationCodeEntity>,
    protected readonly jwtTokenService: JwtTokenService,
  ) {}

  adminLogin(loginRequest: LoginDto, isAdmin: boolean): Observable<AuthResponse> {
    const {email, password} = loginRequest;
    const repository = isAdmin ? this.adminRepository : this.userRepository;
    return from(repository.findOne({where: {email: email, isDeleted: false}})).pipe(
      switchMap((thisAdmin) => {
        if(!thisAdmin){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messages.ADMIN.INVALID_CREDENTIALS
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
            const payload = {
              id: thisAdmin.id,
              type: AuthConstants.admin
            }
            const accessToken = this.jwtTokenService.generateAccessToken(payload)
            const refreshToken = this.jwtTokenService.generateRefreshToken(payload)
            const saveRefToken = {
              token: refreshToken,
              expiresAt: getExpiryDate(15),
              admin: thisAdmin
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
                      message :messages.ADMIN.ADMIN_LOGIN_SUCCESSFUL,
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


  updateEmail(updateEmailDto: UpdateEmailDto, isAdmin: boolean):Observable<E> {
    const repository = isAdmin ? this.adminRepository : this.userRepository;
    return from(repository.findOne({where: {id: updateEmailDto.id, isDeleted: false}})).pipe(
      switchMap((thisAdmin) =>{
        if (!thisAdmin){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messages.ADMIN.NOT_FOUND
          })
        }
        thisAdmin.email = updateEmailDto.email

        return from(repository.save(thisAdmin)).pipe(
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

  protected abstract mapResponse(admin: T): E;
}
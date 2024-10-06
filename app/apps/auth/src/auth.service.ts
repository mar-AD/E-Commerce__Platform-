import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './users/entities/user.entity';
import { Repository } from 'typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { EmailVerificationCodeEntity } from './entities/email-verification-code.entity';
import { AuthResponse, JwtTokenService, messages, RefreshTokenDto } from '@app/common';
import { from, Observable, of, switchMap } from 'rxjs';
import { AuthConstants } from './constants';

@Injectable()
export class BaseService<T> {
  constructor(
    @InjectRepository(UserEntity) protected readonly repository: Repository<T>,
    @InjectRepository(RefreshTokenEntity) protected readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    @InjectRepository(EmailVerificationCodeEntity) protected readonly emailVerificationCodeRepository: Repository<EmailVerificationCodeEntity>,
    protected readonly jwtTokenService: JwtTokenService,
  ) {}

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
}
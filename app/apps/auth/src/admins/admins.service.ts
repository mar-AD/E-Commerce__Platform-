import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Admin, AuthResponse, dateToTimestamp, Empty, FindOneDto, generateEmailCode, getExpiryDate,
  hashPassword, JwtTokenService,
  messages, VerifyEmailCode,
  verifyPassword,
} from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminEntity } from './entities/admin.entity';
import { MoreThan, Repository } from 'typeorm';
import { RoleEntity } from '../roles/entities/role.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { LoginDto } from '@app/common/dtos/login.dto';
import { AuthConstants } from '../constants';
import { UpdatePasswordDto } from '@app/common/dtos/update-password.dto';
import { EmailVerificationCodeEntity } from '../entities/email-verification-code.entity';
import { RequestEmailUpdateDto } from '@app/common/dtos/request-email-update.dto';
import { VerifyEmailCodeDto } from '@app/common/dtos/verify-email-code.dto';
import { UpdateEmailDto } from '@app/common/dtos/update-email.dto';
import { UpdateAdminRoleDto } from './dto/update-admin-role.dto';
import { RefreshTokenDto } from '@app/common/dtos';
import { BaseService } from '../auth.service';

@Injectable()
export class AdminsService extends BaseService<AdminEntity, Admin>{
  constructor(
    @InjectRepository(AdminEntity) protected readonly repository: Repository<AdminEntity>,
    @InjectRepository(RoleEntity) private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(RefreshTokenEntity) protected readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    @InjectRepository(EmailVerificationCodeEntity) protected readonly emailVerificationCodeRepository: Repository<EmailVerificationCodeEntity>,
    protected readonly jwtTokenService: JwtTokenService
  ) {
    super(repository, refreshTokenRepository, emailVerificationCodeRepository, jwtTokenService)
  }
  create(createAdminDto: CreateAdminDto): Observable<Admin> {
    const {role, email, password} = createAdminDto;
    return from(this.roleRepository.findOne({where: {name: role}})).pipe(
      switchMap((thisRole)=>{
        if(!thisRole){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messages.ROLE.NOT_FOUND
          })
        }
        createAdminDto.role = thisRole.id
        return from(this.repository.findOne({where: {email: email}})).pipe(
          switchMap((admin) => {
            if(admin){
              throw new BadRequestException({
                status: HttpStatus.BAD_REQUEST,
                message: `Admin with email: ${email} already exists.`
              })
            }
            return hashPassword(password).pipe(
              switchMap((hashedPass) => {
                createAdminDto.password = hashedPass

                const newAdmin = this.repository.create(createAdminDto)
                return from(this.repository.save(newAdmin)).pipe(

                  //SEND WELCOMING EMAIL TO THIS ADMIN -------------------------------------

                  map((createdAdmin) => this.mapResponse(createdAdmin)),
                  catchError(() =>{
                    throw new BadRequestException({
                      status: HttpStatus.INTERNAL_SERVER_ERROR,
                      message: messages.ADMIN.FAILED_TO_CREATE_ADMIN
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

  adminLogin(loginRequest: LoginDto): Observable<AuthResponse> {
    const {email, password} = loginRequest;
    return from(this.repository.findOne({where: {email: email, isDeleted: false}})).pipe(
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

  updateAdminPassword(updatePasswordDto: UpdatePasswordDto):Observable<Admin> {
    const { password, newPassword, confirmPassword } = updatePasswordDto;
    return from(this.repository.findOne({where: {id: updatePasswordDto.id, isDeleted: false}})).pipe(
      switchMap((thisAdmin) =>{
        if(!thisAdmin){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messages.ADMIN.FAILED_TO_FETCH_ADMIN_FOR_UPDATE
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

                return from(this.repository.save(thisAdmin)).pipe(
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

  requestUpdateEmail(requestEmailUpdateDto:RequestEmailUpdateDto):Observable<Empty>{
    return from(this.repository.findOne({where:{id: requestEmailUpdateDto.id, isDeleted: false}})).pipe(
      switchMap((thisAdmin) =>{
        if (!thisAdmin){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messages.ADMIN.NOT_FOUND
          })
        }
        requestEmailUpdateDto.email = thisAdmin.email
        const code = generateEmailCode()
        const expiredAt = getExpiryDate(0, 0, 5)
        return from(this.emailVerificationCodeRepository.save({admin: {id: requestEmailUpdateDto.id }, code: code, expiresAt: expiredAt})).pipe(

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
      switchMap((thisAdmin) =>{
        if (!thisAdmin){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messages.ADMIN.NOT_FOUND
          })
        }
        return from(this.emailVerificationCodeRepository.findOne({where: {admin: { id: verifyEmailCodeDto.id }, code: verifyEmailCodeDto.verificationCode}})).pipe(
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

  updateAdminEmail(updateEmailDto: UpdateEmailDto):Observable<Admin> {
    return from(this.repository.findOne({where: {id: updateEmailDto.id, isDeleted: false}})).pipe(
      switchMap((thisAdmin) =>{
        if (!thisAdmin){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messages.ADMIN.NOT_FOUND
          })
        }
        thisAdmin.email = updateEmailDto.email

        return from(this.repository.save(thisAdmin)).pipe(
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

  updateAdminRole(id:string, updateAdminRoleDto: UpdateAdminRoleDto):Observable<Admin>{
    return from(this.repository.findOne({where: { id: id, isDeleted: false }})).pipe(
      switchMap((thisAdmin) =>{
        if (!thisAdmin){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messages.ADMIN.NOT_FOUND
          })
        }
        {
          return from(this.roleRepository.findOne({ where: { name: updateAdminRoleDto.role } })).pipe(
            switchMap((newRole) => {
              if (!newRole) {
                throw new BadRequestException({
                  status: HttpStatus.NOT_FOUND,
                  message: messages.ROLE.NOT_FOUND,
                });
              }
              thisAdmin.roleId= newRole;
              return from(this.repository.save(thisAdmin)).pipe(
                map((updatedAdmin) => this.mapResponse(updatedAdmin)),
                catchError(() => {
                  throw new BadRequestException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: messages.ROLE.FAILED_TO_UPDATE_ROLE,
                  });
                }),
              );
            }),
          );
        }
      })
    )
  }

  logoutAdmin(logoutDto: RefreshTokenDto):Observable<Empty> {
    return this.logout( logoutDto, AuthConstants.admin)
  }

  adminRefreshToken(refreshTokenDto: RefreshTokenDto): Observable<AuthResponse> {
    return this.refreshTokenAW(refreshTokenDto, AuthConstants.admin)
  }

  // adminForgotPassword(email: string) {
  //   return `This action updates a #${email} admin`;
  // }
  //
  // adminResetPassword(resetPasswordDto: ResetPasswordDto) {
  //   return `This action updates a #${resetPasswordDto} admin`;
  // }
  //
  // remove(id: string) {
  //   return `This action removes a #${id} admin`;
  // }


  mapResponse(admin: AdminEntity): Admin {
    return {
      id: admin.id,
      roleId: admin.roleId.id,
      email: admin.email,
      isActive: admin.isActive,
      isDeleted: admin.isDeleted,
      isEmailVerified: admin.isEmailVerified,
      createdAt: dateToTimestamp(admin.createdAt),
      updatedAt: dateToTimestamp(admin.updatedAt),
      deletedAt: dateToTimestamp(admin.deletedAt),
    }
  }
}

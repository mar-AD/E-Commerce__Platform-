import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Admin, AuthResponse, dateToTimestamp, Empty, generateEmailCode, getExpiryDate,
  hashPassword, JwtTokenService,
  messages,
  ResetPasswordDto, Role,
  verifyPassword,
} from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminEntity } from './entities/admin.entity';
import { Repository } from 'typeorm';
import { RoleEntity } from '../roles/entities/role.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { LoginAdminDto } from './dto/login-admin.dto';
import { AuthConstants } from '../constants';
import { UpdateAdminPasswordDto } from './dto/update-admin-password.dto';
import { EmailVerificationCodeEntity } from '../entities/email-verification-code.entity';
import { RequestEmailUpdateDto } from './dto/request-email-update.dto';
import { VerifyEmailCodeDto } from './dto/verify-email-code.dto';
import { UpdateAdminEmailDto } from './dto/update-admin-email.dto';
import { UpdateAdminRoleDto } from './dto/update-admin-role.dto';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(AdminEntity) private readonly adminRepository: Repository<AdminEntity>,
    @InjectRepository(RoleEntity) private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(RefreshTokenEntity) private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    @InjectRepository(EmailVerificationCodeEntity) private readonly emailVerificationCodeRepository: Repository<EmailVerificationCodeEntity>,
    private readonly jwtTokenService: JwtTokenService
  ) {
  }
  create(createAdminDto: CreateAdminDto): Observable<Admin> {
    const {role, email, password} = createAdminDto;
    return from(this.roleRepository.findOne({where: {name: role}, relations: ['role'],})).pipe(
      switchMap((thisRole)=>{
        if(!thisRole){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messages.ROLE.NOT_FOUND
          })
        }
        createAdminDto.role = thisRole.id
        return from(this.adminRepository.findOne({where: {email: email}})).pipe(
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

                const newAdmin = this.adminRepository.create(createAdminDto)
                return from(this.adminRepository.save(newAdmin)).pipe(

                  //SEND WELCOMING EMAIL TO THIS ADMIN -------------------------------------

                  map((createdAdmin) => this.mapAdminResponse(createdAdmin)),
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

  adminLogin(loginRequest: LoginAdminDto): Observable<AuthResponse> {
    const {email, password} = loginRequest;
    return from(this.adminRepository.findOne({where: {email: email}})).pipe(
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
              admin_id: thisAdmin.id
            }
            return from(this.refreshTokenRepository.save(saveRefToken)).pipe(
              switchMap((refToken) => {
                if(!refToken){
                  throw new BadRequestException({
                    status: HttpStatus.BAD_REQUEST,
                    message: 'Failed to save refresh token'
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

  updateAdminPassword(updatePasswordDto: UpdateAdminPasswordDto):Observable<Admin> {
    const { password, newPassword, confirmPassword } = updatePasswordDto;
    return from(this.adminRepository.findOne({where: {id: updatePasswordDto.id}})).pipe(
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

                return from(this.adminRepository.save(thisAdmin)).pipe(
                  map((updatedAdmin)=> this.mapAdminResponse(updatedAdmin)),
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
    return from(this.adminRepository.findOne({where:{id: requestEmailUpdateDto.id}})).pipe(
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
    return from(this.adminRepository.findOne({where: {id: verifyEmailCodeDto.id}})).pipe(
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

  updateAdminEmail(updateEmailDto: UpdateAdminEmailDto):Observable<Admin> {
    return from(this.adminRepository.findOne({where: {id: updateEmailDto.id}})).pipe(
      switchMap((thisAdmin) =>{
        if (!thisAdmin){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messages.ADMIN.NOT_FOUND
          })
        }
        thisAdmin.email = updateEmailDto.email

        return from(this.adminRepository.save(thisAdmin)).pipe(
          map((updatedAdmin) => this.mapAdminResponse(updatedAdmin)),
          catchError((error)=>{
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
    return from(this.adminRepository.findOne({where: { id }})).pipe(
      switchMap((thisAdmin) =>{
        if (!thisAdmin){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messages.ADMIN.NOT_FOUND
          })
        }
        //4eda ankmlhaa------------------------------

        return from(this.adminRepository.save(thisAdmin)).pipe(
          map((updatedAdmin) => this.mapAdminResponse(updatedAdmin)),
          catchError((error)=>{
            throw new BadRequestException({
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              message: messages.EMAIL.FAILED_TO_UPDATE_EMAIL
            })
          })
        )
      })
    )
  }
  //
  // logoutAdmin(refreshToken: string) {
  //   return `This action updates a #${refreshToken} user`;
  // }
  //
  // adminRefreshToken(refreshToken: string) {
  //   return `This action updates a #${refreshToken} admin`;
  // }
  //
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

  mapAdminResponse(admin: AdminEntity): Admin {
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

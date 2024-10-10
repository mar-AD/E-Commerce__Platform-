import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Admin,
  AuthResponse,
  dateToTimestamp,
  Empty, ForgotPasswordDto,
  JwtTokenService,
  LoginDto,
  messages, RefreshTokenDto, RequestEmailUpdateDto, UpdateEmailDto,
  UpdatePasswordDto, VerifyEmailCodeDto,
} from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminEntity } from './entities/admin.entity';
import { Repository } from 'typeorm';
import { RoleEntity } from '../roles/entities/role.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { catchError, from, map, Observable, switchMap } from 'rxjs';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { AuthConstants } from '../constants';
import { EmailVerificationCodeEntity } from '../entities/email-verification-code.entity';
import { UpdateAdminRoleDto } from './dto/update-admin-role.dto';
import { BaseService } from '../auth.service';
import { UserEntity } from '../users/entities/user.entity';
import { FindOneDto, ResetPasswordDto } from '@app/common/dtos';

@Injectable()
export class AdminsService extends BaseService<Admin>{
  constructor(
    @InjectRepository(AdminEntity) protected readonly adminRepository: Repository<AdminEntity>,
    @InjectRepository(UserEntity) protected readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity) private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(RefreshTokenEntity) protected readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    @InjectRepository(EmailVerificationCodeEntity) protected readonly emailVerificationCodeRepository: Repository<EmailVerificationCodeEntity>,
    protected readonly jwtTokenService: JwtTokenService
  ) {
    super(adminRepository, userRepository, refreshTokenRepository, emailVerificationCodeRepository, jwtTokenService)
  }
  createAdmin(createAdminDto: CreateAdminDto): Observable<Admin> {
    const {role} = createAdminDto;
    return from(this.roleRepository.findOne({where: {name: role}})).pipe(
      switchMap((thisRole)=>{
        if(!thisRole){
          throw new BadRequestException({
            status: HttpStatus.NOT_FOUND,
            message: messages.ROLE.NOT_FOUND
          })
        }
        createAdminDto.role = thisRole.id
        return this.create(createAdminDto, AuthConstants.admin)
      })
    )
  }

  adminLogin(loginRequest: LoginDto): Observable<AuthResponse> {
   return this.login(loginRequest, AuthConstants.admin)
  }

  updateAdminPassword(updatePasswordDto: UpdatePasswordDto):Observable<Admin> {
    return this.updatePassword(updatePasswordDto, AuthConstants.admin)
  }

  requestUpdateEmail(requestEmailUpdateDto:RequestEmailUpdateDto):Observable<Empty>{
    return this.requestUpEmail(requestEmailUpdateDto, AuthConstants.admin)
  }

  verifyEmailCode(verifyEmailCodeDto: VerifyEmailCodeDto): Observable<Empty>{
    return this.verifyCode(verifyEmailCodeDto, AuthConstants.admin)
  }

  updateAdminEmail(updateEmailDto: UpdateEmailDto):Observable<Admin> {
    return this.updateEmail(updateEmailDto, AuthConstants.admin)
  }

  updateAdminRole(id:string, updateAdminRoleDto: UpdateAdminRoleDto):Observable<Admin>{
    return from(this.adminRepository.findOne({where: { id: id, isDeleted: false }})).pipe(
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
              return from(this.adminRepository.save(thisAdmin)).pipe(
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

  adminForgotPassword(forgotPassDto: ForgotPasswordDto): Observable<Empty> {
    return this.forgotPassword(forgotPassDto, AuthConstants.admin)
  }

  adminResetPassword(resetPasswordDto: ResetPasswordDto): Observable<Empty> {
    return this.resetPassword(resetPasswordDto, AuthConstants.admin)
  }

  deleteAdmin(findOneDto: FindOneDto): Observable<Empty> {
    return this.remove(findOneDto, AuthConstants.admin);
  }


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

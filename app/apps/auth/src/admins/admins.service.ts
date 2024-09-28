import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Admin, AuthResponse, dateToTimestamp,
  hashPassword, JwtTokenService,
  messages,
  ResetPasswordDto, Role,
  UpdateAdminEmailDto,
  UpdateAdminPasswordDto, verifyPassword,
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

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(AdminEntity) private readonly adminRepository: Repository<AdminEntity>,
    @InjectRepository(RoleEntity) private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(RefreshTokenEntity) private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
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
            const payload = {id: thisAdmin.id, type: AuthConstants.admin}
            const accessToken = this.jwtTokenService.generateAccessToken(payload)
            const refreshToken = this.jwtTokenService.generateRefreshToken(payload)
            return of(
              {
                accessToken: accessToken,
                refreshToken: refreshToken,
              },

            );
          })
        )
      })
    )
  }
  //
  // updateAdminPassword(id: string, updatePasswordDto: UpdateAdminPasswordDto) {
  //   return `This action updates user password a #${updatePasswordDto}`;
  // }
  //
  // updateAdminEmail(id: string, updateEmailDto: UpdateAdminEmailDto) {
  //   return `This action updates user password a #${updateEmailDto}`;
  // }
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
      updatedAt: dateToTimestamp(admin.updatedAt)
    }
  }
}

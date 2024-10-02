import { BadRequestException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  AuthResponse,
  dateToTimestamp, getExpiryDate, hashPassword, JwtTokenService,
  LoginDto, messages,
  ResetPasswordDto,
  UpdateUserEmailDto,
  User, verifyPassword,
} from '@app/common';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { ResponseDto } from '@app/common/types/response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthConstants } from '../constants';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity) private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    private readonly jwtTokenService: JwtTokenService,
  ) {
  }

  create(createUserDto: CreateUserDto) : Observable<User> {
    const { email, password } = createUserDto;
    return from(this.userRepository.findOne({ where: { email } })).pipe(
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

            const newUser = this.userRepository.create(createUserDto)
            return from(this.userRepository.save(newUser)).pipe(
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

  login(loginRequest: LoginUserDto): Observable<AuthResponse> {
    const {email, password} = loginRequest
    return from(this.userRepository.findOne({where:{email: email}})).pipe(
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
              user_id: thisUser.id
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
                })
              })
            )
          })
        )
      })
    )
  }
  //
  updateUserPass(updatePasswordDto: UpdateUserPasswordDto):Observable<User> {
    const {password, newPassword, confirmPassword} = updatePasswordDto
    return from(this.userRepository.findOne({where:{id: updatePasswordDto.id}})).pipe(
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
                message: 'New password and confirm password do not match.'
              })
            }
            return hashPassword(newPassword).pipe(
              switchMap((hashedPass)=> {
                thisUser.password = hashedPass

                return from(this.userRepository.save(thisUser)).pipe(
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
  //
  // updateUserEmail(id: string, updateEmailDto: UpdateUserEmailDto) {
  //   return `This action updates user password a #${id, updateEmailDto}`;
  // }
  //
  // logoutUser(refreshToken: string) {
  //   return `This action updates a #${refreshToken} user`;
  // }
  //
  // userRefreshToken(refreshToken: string) {
  //   return `This action updates a #${refreshToken} user`;
  // }
  //
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



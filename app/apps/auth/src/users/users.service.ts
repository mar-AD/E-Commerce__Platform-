import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import {
  dateToTimestamp, hashPassword,
  LoginDto, messages,
  ResetPasswordDto,
  UpdateUserEmailDto,
  UpdateUserPasswordDto, User,
} from '@app/common';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { catchError, from, map, Observable, switchMap } from 'rxjs';
import { ResponseDto } from '@app/common/types/response.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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
              catchError((error) => {
                throw new BadRequestException({
                  status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
                  message: error.response || messages.USER.FAILED_TO_CREATE_USER,
                });
              })
            )
          })
        )
      })
    )
  }

  // login(loginRequest: LoginDto) {
  //   return `This action logs in users`;
  // }
  //
  // updateUserPass(id: string, updatePasswordDto: UpdateUserPasswordDto) {
  //   return `This action updates user password a #${id, updatePasswordDto}`;
  // }
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
      updatedAt: dateToTimestamp(user.updatedAt)
    }
  }
}



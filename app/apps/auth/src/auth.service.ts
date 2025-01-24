import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './users/entities/user.entity';
import { MoreThan, Repository } from 'typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { EmailVerificationCodeEntity } from './entities/email-verification-code.entity';
import {
  AuthResponse, BaseResponse,
  Empty,
  FindOneDto,
  generateEmailCode,
  getExpiryDate,
  hashPassword,
  JwtTokenService,
  LoggerService,
  messages,
  TokenDto,
  VerifyEmailCode,
  verifyPassword,
} from '@app/common';
import { catchError, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { AuthConstants } from './constants';
import { AdminEntity } from './admins/entities/admin.entity';
import {
  CreateDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RequestEmailUpdateDto,
  ResetPasswordDto,
  UpdateEmailDto,
  UpdatePasswordDto,
  VerifyEmailCodeDto,
} from '@app/common/dtos/auth-dtos';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { RoleEntity } from './roles/entities/role.entity';
import { ConfigService } from '@nestjs/config';
import { UpdateAdminProfileDto, UpdateUserProfileDto } from '@app/common/dtos';


@Injectable()
export abstract class  BaseService<E,T extends { entities: E[] }> {

  protected constructor(
    @InjectRepository(AdminEntity) protected readonly adminRepository: Repository<AdminEntity>,
    @InjectRepository(UserEntity) protected readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity) protected readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    @InjectRepository(EmailVerificationCodeEntity) protected readonly emailVerificationCodeRepository: Repository<EmailVerificationCodeEntity>,
    protected readonly jwtTokenService: JwtTokenService,
    protected readonly logger: LoggerService,
    protected readonly configService: ConfigService,
    @Inject('RMQ_EMAIL_CLIENT') protected readonly clientEmail: ClientProxy,
    @Inject('RMQ_USERS_CLIENT') protected readonly clientUser: ClientProxy,
    @Inject('RMQ_ADMINS_CLIENT') protected readonly clientAdmin: ClientProxy
  ) {
  }

  create(roleId: RoleEntity, createDto: CreateDto, type: AuthConstants) : Observable<E> {
    const {email, password } = createDto;

    const repository= this.getRepository(type);
    const messageType = this.getMessageType(type);
    this.logger.log(`${type+'Repo'}: Searching for entity by email "${email}" in repository...'`);

    return from(repository.findOne({ where: { email } })).pipe(
      switchMap((existingEntity)=>{
        if(existingEntity){
          this.logger.log(`${type+'Repo'}: entity with email "${email}" already exists.`);
          throw new RpcException({
            code: status.ALREADY_EXISTS,
            message: `${type} with email: ${email} already exists.`,
          });
        }
        this.logger.log(`${type+'Repo'}: Hashing the password for the new entity...'`);
        return hashPassword(password).pipe(
          switchMap((hashedPass)=>{
            createDto.password = hashedPass;

            this.logger.log(`${type+'Repo'}: proceeding to create Entity...`);
            const newEntity = this.CreateEntity(type, roleId, createDto);

            this.logger.log(`${type+'Repo'}: Saving the new entity to the repository...`);
            return from(repository.save(newEntity)).pipe(
              map((createdEntity) => {

                if (type === AuthConstants.user){
                  this.logger.log(`Emitting create_user_profile event for "${createdEntity.id}".`);
                  this.clientUser.emit('create_user_profile', { userId: createdEntity.id });
                }else if (type === AuthConstants.admin){
                  this.logger.log(`Emitting create_admin_profile event for "${createdEntity.id}".`);
                  this.clientAdmin.emit('create_admin_profile', { adminId: createdEntity.id });
                }
                this.logger.log(`${type+'Repo'}: Entity successfully created with email "${email}".`);
                return this.mapResponse(createdEntity);
              }),
              catchError((err) => {
                this.logger.error(`${type+'Repo'}: Failed to create and save the entity with email "${email}". Error: ${err.message}`);
                throw new RpcException({
                  code: status.INTERNAL,
                  message: messageType.FAILED_TO_CREATE,
                });
              })
            )
          })
        )
      }),

    //SEND WELCOMING EMAIL TO THIS ADMIN/USER -------------------------------------

    tap(()=>{
      this.logger.log(`Emitting welcome_email event for ${email}...`);

      this.clientEmail.emit('welcome_email', { email: email }).pipe(

        tap(()=>{
          this.logger.log(`Successfully emitted welcome_email event for ${email}.`);
        }),

        catchError((err) => {
          this.logger.error(
            `Failed to emit welcome_email event for ${email}. Error: ${err.message}`
          );
          return of(null); // Handle error gracefully
        })
      ).subscribe()
    }),
    )
  }

  private CreateEntity(type: AuthConstants, roleId: RoleEntity | null, createDto: CreateDto): any {
    if (type === AuthConstants.admin) {
      return {
        ...createDto,
        roleId: roleId
      }
    }
    return createDto
  }

  login(loginRequest: LoginDto, type: AuthConstants): Observable<AuthResponse> {
    const {email, password} = loginRequest;
    const repository = this.getRepository(type);
    const messageType = this.getMessageType(type)

    this.logger.log(`${type+'Repo'}: Searching for entity by email "${email}" in repository...'`);
    return from(repository.findOne({where: {email: email, isDeleted: false}})).pipe(
      switchMap((thisEntity) => {
        if(!thisEntity){
          this.logger.error(`${type+'Repo'}: entity with email "${email}" is not exist.`);
          throw new RpcException({ code: status.NOT_FOUND, message: messageType.INVALID_CREDENTIALS});
        }

        this.logger.log(`${type+'Repo'}: Verifying password ...`);
        return verifyPassword(password, thisEntity.password).pipe(
          switchMap((isMatch)=>{
            if (!isMatch) {
              this.logger.error(`${type+'Repo'}: Password verification failed.`);
              throw new RpcException({ code: status.UNAUTHENTICATED, message: messages.PASSWORD.INVALID_PASSWORD });
            }
            const payload = {
              id: thisEntity.id,
              type: type
            }

            this.logger.log(`${type+'Repo'}: Generating access and refresh tokens ...`);
            const accessToken = this.jwtTokenService.generateAccessToken(payload)
            const refreshToken = this.jwtTokenService.generateRefreshToken(payload)
            const saveRefToken = {
              token: refreshToken,
              expiresAt: getExpiryDate(15),
              [type]: thisEntity
            }

            this.logger.log(`refreshTknRepo: Saving the refToken to the repo.`);
            return from(this.refreshTokenRepository.save(saveRefToken)).pipe(
              switchMap((refToken) => {
                if(!refToken){
                  this.logger.error(`refreshTknRepo: Failed saving the refToken to the repo.`);
                  throw new RpcException({ code: status.INTERNAL, message: messages.TOKEN.FAILED_TO_SAVE_REF_TOKEN });
                }

                this.logger.log(`${type+'Repo'}: ${type} logged in successfully`);
                return of(
                  {
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    result: {
                      status: HttpStatus.OK,
                      message :messageType.LOGIN_SUCCESSFUL,
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

  updatePassword(findOneDto: FindOneDto, updatePasswordDto: UpdatePasswordDto, type: AuthConstants):Observable<E> {
    const { password, newPassword, confirmPassword } = updatePasswordDto;
    const repository = this.getRepository(type);
    const messageType = this.getMessageType(type)

    this.logger.log(`${type+'Repo'}: Searching for entity by ID "${findOneDto.id}" in repository...`);
    return from(repository.findOne({where: {id: findOneDto.id, isDeleted: false}})).pipe(
      switchMap((thisEntity) =>{
        if(!thisEntity){
          this.logger.error(`${type+'Repo'}: entity with ID "${findOneDto.id}" doesn't exist.`);
          throw new RpcException ({
            code: status.NOT_FOUND,
            message: messageType.FAILED_TO_FETCH_FOR_UPDATE
          })
        }
        this.logger.log(`${type+'Repo'}: Verifying password ...`);
        return verifyPassword(password, thisEntity.password).pipe(
          switchMap((isMatch)=>{
            if (!isMatch) {
              this.logger.error(`${type+'Repo'}: Password verification failed.`);
              throw new RpcException({
                code: status.UNAUTHENTICATED,
                message: messages.PASSWORD.INVALID_PASSWORD,
              });
            }
            if(newPassword !== confirmPassword){
              this.logger.error(`${type+'Repo'}: New Password and conform password do not match.`);
              throw new RpcException({
                code: status.INVALID_ARGUMENT,
                message: messages.PASSWORD.PASSWORDS_DO_NOT_MATCH,
              });
            }
            this.logger.log(`${type+'Repo'}: Hashing password...`);
            return hashPassword(newPassword).pipe(
              switchMap((hashedPassword)=>{
                thisEntity.password = hashedPassword

                this.logger.log(`${type+'Repo'}: Saving the updated entity to the repository...`);
                return from(repository.save(thisEntity)).pipe(
                  map((updatedEntity)=> this.mapResponse(updatedEntity)),
                  catchError((err)=>{
                    this.logger.error(`${type+'Repo'}: Failed to update the entity. Error: ${err.message}`)
                    throw new RpcException({
                      code: status.INTERNAL,
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

  requestUpEmail(findOneDto: FindOneDto, requestEmailUpdateDto: RequestEmailUpdateDto, type: AuthConstants): Observable<Empty> {
    const code = generateEmailCode();
    const expiredAt = getExpiryDate(0, 0, 5);

    const condition = this.getCondition(type, { code: code, expiresAt: expiredAt }, { id: findOneDto.id });
    const repository = this.getRepository(type);
    const messageType = this.getMessageType(type);

    this.logger.log(`${type + 'Repo'}: Finding entity with id: ${findOneDto.id} for email update...`);

    return from(repository.findOne({ where: { id: findOneDto.id, isDeleted: false } })).pipe(
      switchMap((thisEntity) => {
        if (!thisEntity) {
          this.logger.error(`${type + 'Repo'}: Entity not found with id: ${findOneDto.id}`);
          throw new RpcException ({
            code: status.NOT_FOUND,
            message: messageType.FAILED_FETCH,
          });
        }

        this.logger.log(`${type + 'Repo'}: Entity found, proceeding to request email update for: ${thisEntity.email}`);
        if (requestEmailUpdateDto.email !== thisEntity.email){
          throw new RpcException ({
            code: status.INVALID_ARGUMENT,
            message: `This ${type} is associated with a different email. Please verify the email and try again.`
          });
        }


        this.logger.log(`emailVerificationCodeRepo: Saving the email code entity ...`);
        return from(this.emailVerificationCodeRepository.save(condition)).pipe(
          map(() => {
            this.logger.log(`${type + 'Repo'}: Email verification code sent successfully for email: ${thisEntity.email}`);
            return {
              result: {
                status: HttpStatus.OK,
                message: messages.EMAIL.EMAIL_VERIFICATION_CODE_SENT_SUCCESSFULLY,
              },
            };
          }),
          catchError((error) => {
            this.logger.error(`${type + 'Repo'}: Failed to send email verification code. Error: ${error.message}`);
            throw new RpcException({
              code: status.INTERNAL,
              message: error.message,
            });
          })
        );
      }),
      // SEND AN EMAIL THAT CONTAINS THIS CODE TO THIS USER -----------------------------------------------

      tap(()=>{
        this.logger.log(`Emitting req_update_email_email event for ${requestEmailUpdateDto.email}...`)
        this.clientEmail.emit('req_update_email_email', {email: requestEmailUpdateDto.email, verificationCode: code}).pipe(
          tap(()=>{
            this.logger.log(`Successfully emitted req_update_email_email event for ${requestEmailUpdateDto.email}.`);
          }),
          catchError((error)=>{
            this.logger.error(`Failed to emit req_update_email_email event for ${requestEmailUpdateDto.email}. Error: ${error.message}`);
            return of(null);
          })
        ).subscribe()
      })
    );
  }

  verifyCode(findOneDto: FindOneDto, verifyEmailCodeDto: VerifyEmailCodeDto, type: AuthConstants): Observable<Empty> {

    const whereCondition = this.getCondition(type, { code: verifyEmailCodeDto.verificationCode }, { id: findOneDto.id });
    const repository = this.getRepository(type);
    const messageType = this.getMessageType(type);

    this.logger.log(`${type + 'Repo'}: Searching for entity with id: ${findOneDto.id} to verify code...`);

    return from(repository.findOne({ where: { id: findOneDto.id, isDeleted: false } })).pipe(
      switchMap((thisEntity) => {
        if (!thisEntity) {
          this.logger.error(`${type + 'Repo'}: Entity not found with id: ${findOneDto.id}`);
          throw new RpcException ({
            code: status.NOT_FOUND,
            message: messageType.FAILED_FETCH,
          });
        }

        this.logger.log(`emailVerificationCodeRepo: Proceeding to find verification code for: ${thisEntity.email}`);
        return from(this.emailVerificationCodeRepository.findOne({ where: whereCondition })).pipe(
          map((verificationCode) => {
            if (!verificationCode) {
              this.logger.error(`Verification code not found or invalid for id: ${findOneDto.id}`);
              throw new NotFoundException ({
                code: status.NOT_FOUND,
                message: 'Verification code not found or invalid.',
              });
            }

            this.logger.log(`Verification code found. Verifying code for id: ${findOneDto.id}`);
            VerifyEmailCode(verificationCode.expiresAt);

            this.logger.log(`Verification code successfully verified for id: ${findOneDto.id}`);
            return {
              result: {
                status: HttpStatus.OK,
                message: 'The code was verified successfully',
              },
            };
          }),
          catchError((error) => {
            this.logger.error(`Error verifying code for id: ${findOneDto.id}. Error: ${error.message}`);
            throw new RpcException({
              code: status.INTERNAL,
              message: error.message,
            });
          })
        );
      })
    );
  }

  updateEmail(findOneDto: FindOneDto, updateEmailDto: UpdateEmailDto, type: AuthConstants): Observable<E> {
    const repository = this.getRepository(type);
    const messageType = this.getMessageType(type);

    this.logger.log(`${type + 'Repo'}: Searching for entity with id: ${findOneDto.id} to update email...`);

    return from(repository.findOne({ where: { id: findOneDto.id, isDeleted: false } })).pipe(
      switchMap((thisEntity) => {
        if (!thisEntity) {
          this.logger.error(`${type + 'Repo'}: Entity not found with id: ${findOneDto.id}.`);
          throw new RpcException ({
            code: status.NOT_FOUND,
            message: messageType.FAILED_TO_FETCH_FOR_UPDATE
          });
        }

        this.logger.log(`${type + 'Repo'}: Entity found. Updating email for id: ${findOneDto.id}.`);
        thisEntity.email = updateEmailDto.email;

        return from(repository.save(thisEntity)).pipe(
          map((updatedEntity) => {
            this.logger.log(`${type + 'Repo'}: Email updated successfully for id: ${findOneDto.id}.`);
            return this.mapResponse(updatedEntity);
          }),
          catchError((error) => {
            this.logger.error(`${type + 'Repo'}: Failed to update email for id: ${findOneDto.id}. Error: ${error.message}`);
            throw new InternalServerErrorException({
              code: status.INTERNAL,
              message: messages.EMAIL.FAILED_TO_UPDATE_EMAIL,
            });
          })
        );
      })
    );
  }

  refreshTokenAW(refreshTokenDto: RefreshTokenDto, type: AuthConstants): Observable<AuthResponse> {
    const { refreshToken } = refreshTokenDto;
    const { id } = this.jwtTokenService.decodeToken(refreshToken);

    this.logger.log(`${type + 'Repo'}: Decoding refresh token for id: ${id}...`);

    const whereCondition = this.getCondition(type, { token: refreshToken, revoked: false }, { id: id, isDeleted: false });

    this.logger.log(`refreshTokenRepo: Searching for refresh token for id: ${id}...`);
    return from(this.refreshTokenRepository.findOne({ where: whereCondition })).pipe(
      switchMap((refToken) => {
        if (!refToken) {
          this.logger.error(`${type + 'Repo'}: Refresh token not found or revoked for id: ${id}.`);
          throw new RpcException  ({
            code: status.NOT_FOUND,
            message: messages.TOKEN.TOKEN_NOT_FOUND
          });
        }

        this.logger.log(`${type + 'Repo'}: Refresh token found for id: ${id}. Checking expiration...`);
        const currenTime = new Date();
        const expirationDate = refToken.expiresAt;
        const timeLeft = expirationDate.getTime() - currenTime.getTime();
        const oneHourToExp = 60 * 60 * 1000;

        if (expirationDate <= currenTime) {
          this.logger.warn(`${type + 'Repo'}: Refresh token has expired for id: ${id}. Revoking token...`);
          refToken.revoked = true;
          return from(this.refreshTokenRepository.save(refToken)).pipe(
            switchMap(() => {
              this.logger.error(`${type + 'Repo'}: Refresh token expired for id: ${id}.`);
              throw new RpcException({
                code: status.UNAUTHENTICATED,
                message: messages.TOKEN.REF_TOKEN_HAS_EXPIRED
              });
            })
          );
        } else if (timeLeft <= oneHourToExp) {
          this.logger.warn(`${type + 'Repo'}: Refresh token will expire within an hour for id: ${id}. Revoking token...`);
          refToken.revoked = true;
          return from(this.refreshTokenRepository.save(refToken)).pipe(
            switchMap(() => {
              this.logger.error(`${type + 'Repo'}: Refresh token will expire soon for id: ${id}.`);
              throw new BadRequestException({
                code: status.UNAUTHENTICATED,
                message: messages.TOKEN.REF_TOKEN_WILL_EXPIRE
              });
            })
          );
        }

        this.logger.log(`${type + 'Repo'}: Generating new access token for id: ${id}.`);
        const newAccessToken = this.jwtTokenService.generateAccessToken({ id: refToken[type].id, type: type });

        return of({
          refreshToken: refreshToken,
          accessToken: newAccessToken,
          result: {
            status: HttpStatus.OK,
            message: messages.TOKEN.TOKEN_GENERATED_SUCCESSFULLY,
          }
        });
      })
    );
  }

  logout(logoutDto: RefreshTokenDto, type: AuthConstants): Observable<Empty> {
    const { refreshToken } = logoutDto;
    const { id } = this.jwtTokenService.decodeToken(refreshToken);

    this.logger.log(`${type + 'Repo'}: Decoding refresh token for logout with id: ${id}...`);

    const whereConditions = this.getCondition(type, { token: refreshToken, expiresAt: MoreThan(new Date()) }, { id: id });

    this.logger.log(`refreshTokenRepo: Searching for refresh token for id: ${id}...`);
    return from(this.refreshTokenRepository.findOne({ where: whereConditions })).pipe(
      switchMap((refToken) => {
        if (!refToken) {
          this.logger.error(`${type + 'Repo'}: Refresh token not found for id: ${id}.`);
          throw new RpcException ({
            code: status.NOT_FOUND,
            message: messages.TOKEN.TOKEN_NOT_FOUND
          });
        }

        this.logger.log(`${type + 'Repo'}: Revoking refresh token for id: ${id}.`);
        refToken.revoked = true;

        return from(this.refreshTokenRepository.save(refToken)).pipe(
          map(() => {
            this.logger.log(`${type + 'Repo'}: Refresh token successfully revoked for id: ${id}.`);
            return {
              result: {
                status: HttpStatus.OK,
                message: messages.TOKEN.REF_TOKEN_REVOKED_SUCCESSFULLY,
              },
            };
          }),
          catchError((error) => {
            this.logger.error(`${type + 'Repo'}: Error while revoking refresh token for id: ${id}. Error: ${error.message}`);
            throw new RpcException({
              code: status.INTERNAL,
              message: error.message,
            });
          }),
        );
      })
    );
  }

  forgotPassword(forgotPassDto: ForgotPasswordDto, type: AuthConstants): Observable<Empty> {
    const { email } = forgotPassDto;
    const repository = this.getRepository(type);
    const messageType = this.getMessageType(type);

    let token: string ;
    this.logger.log(`${type + 'Repo'}: Initiating password reset for email: ${email}...`);

    return from(repository.findOne({ where: { email: email, isDeleted: false } })).pipe(
      map((thisEntity) => {
        if (!thisEntity) {
          this.logger.error(`${type + 'Repo'}: User not found for email: ${email}.`);
          throw new RpcException ({
            code: status.NOT_FOUND,
            message: messageType.NOT_FOUND
          });
        }

        const payload = {
          id: thisEntity.id,
          type: type
        };
        token = this.jwtTokenService.generateAccessToken(payload);
        console.log('Generated Token:', token);

        this.logger.log(`${type + 'Repo'}: Password reset email sent for email: ${email}.`);

        return {
          result: {
            status: HttpStatus.OK,
            message: messages.EMAIL.RESET_PASS_EMAIL_SENT
          }
        };
      }),
      // SEND EMAIL--WILL DO WHEN I CREATE THE EMAIL SERVICE ------------------------------

      tap(()=>{
        this.logger.log(`Emitting reset_pass_email event for ${email}...`)
        this.clientEmail.emit('reset_pass_email', {email: email, token: token}).pipe(
          tap(()=>{
            this.logger.log(`Successfully emitted reset_pass_email event for ${email}.`);
          }),
          catchError((error)=>{
            this.logger.error(`Failed to emit reset_pass_email event for ${email}. Error: ${error.message}`);
            return of(null);
          })
        ).subscribe()
      })
    );
  }

  resetPassword(tokenDto: TokenDto, resetPasswordDto: ResetPasswordDto, type: AuthConstants): Observable<Empty> {
    const { newPassword, confirmPassword } = resetPasswordDto;
    const {token} = tokenDto
    const repository = this.getRepository(type);
    const messageType = this.getMessageType(type);

    const { id } = this.jwtTokenService.decodeToken(token);

    this.logger.log(`${type + 'Repo'}: Initiating password reset for user ID: ${id}...`);

    return from(repository.findOne({ where: { id: id, isDeleted: false} })).pipe(
      switchMap((thisEntity) => {
        if (!thisEntity) {
          this.logger.error(`${type + 'Repo'}: User not found for ID: ${id}.`);
          throw new RpcException ({
            code: status.NOT_FOUND,
            message: messageType.FAILED_TO_FETCH_FOR_UPDATE
          });
        }

        if (newPassword !== confirmPassword) {
          this.logger.warn(`${type + 'Repo'}: Passwords do not match for user ID: ${id}.`);
          throw new RpcException({
            code: status.INVALID_ARGUMENT,
            message: messages.PASSWORD.PASSWORDS_DO_NOT_MATCH,
          });
        }

        return hashPassword(newPassword).pipe(
          switchMap((hashedPass) => {
            thisEntity.password = hashedPass;

            return from(repository.save(thisEntity)).pipe(
              map(() => {
                this.logger.log(`${type + 'Repo'}: Password reset successfully for user ID: ${id}.`);
                return {
                  result: {
                    status: HttpStatus.OK,
                    message: messages.PASSWORD.PASSWORD_RESET_SUCCESSFULLY
                  }
                };
              }),
              catchError((error) => {
                this.logger.error(`${type + 'Repo'}: Failed to reset password for user ID: ${id}. Error: ${error.message}`);
                throw new RpcException({
                  code: status.INTERNAL,
                  message: messages.PASSWORD.FAILED_TO_RESET_PASSWORD
                });
              })
            );
          })
        );
      })
    );
  }

  remove(findOneDto: FindOneDto, type: AuthConstants): Observable<Empty> {
    const repository = this.getRepository(type);
    const messageType = this.getMessageType(type);

    this.logger.log(`${type + 'Repo'}: Attempting to remove entity with ID: ${findOneDto.id}...`);

    return from(repository.findOne({ where: { id: findOneDto.id, isDeleted: false, isActive:true, isEmailVerified:false } })).pipe(
      switchMap((thisEntity) => {
        if (!thisEntity) {
          this.logger.error(`${type + 'Repo'}: Entity not found for ID: ${findOneDto.id}.`);
          throw new RpcException ({
            code: status.NOT_FOUND,
            message: messageType.FAILED_FETCH_FOR_REMOVAL
          });
        }

        thisEntity.isDeleted = true;
        return from(repository.save(thisEntity)).pipe(
          switchMap(() => {
            return from(repository.softRemove(thisEntity)).pipe(
              map(() => {
                this.logger.log(`${type + 'Repo'}: Entity with ID: ${findOneDto.id} removed successfully.`);
                return {
                  result: {
                    status: HttpStatus.OK,
                    message: messageType.REMOVED_SUCCESSFULLY
                  }
                };
              }),
              catchError((error) => {
                this.logger.error(`${type + 'Repo'}: Failed to remove entity with ID: ${findOneDto.id}. Error: ${error.message}`);
                throw new RpcException({
                  code: status.INTERNAL,
                  message: messageType.FAILED_REMOVE
                });
              })
            );
          }),
          catchError((error) => {
            this.logger.error(`${type + 'Repo'}: Failed to save entity with ID: ${findOneDto.id}. Error: ${error.message}`);
            throw new RpcException({
              code: status.INTERNAL,
              message: messageType.FAILED_REMOVE
            });
          })
        );
      }),
      catchError((error) => {
        this.logger.error(`${type + 'Repo'}: Failed to find entity for removal. Error: ${error.message}`);
        throw new RpcException({
          code: status.INTERNAL,
          message: messageType.FAILED_REMOVE
        });
      })
    );
  }

  //i need it for the authguard (internally)
  getOne(id: string, type: AuthConstants): Observable<E> {
    const findOneDto: FindOneDto = {id}
    const repository = this.getRepository(type);
    const messageType = this.getMessageType(type);
    let conditioning: Record<string, any> = {where: {id: findOneDto.id, isDeleted: false, isActive: true, isEmailVerified: false}};
    if (type === AuthConstants.admin) {
      conditioning = {
        ...conditioning ,
        relations: ['roleId']}
    }
    this.logger.log(`${type + 'Repo'}: Attempting to find entity with ID: ${findOneDto.id}...`);

    return from(repository.findOne(conditioning)).pipe(
      map((thisEntity) => {
        if (!thisEntity) {
          throw new RpcException({
            code: status.NOT_FOUND,
            message: messageType.NOT_FOUND2
          })
        }
        this.logger.log(`${type + 'Repo'}: entity with ID: ${findOneDto.id} found successfully`);
        return this.mapResponse(thisEntity)
      })
    )
  }


  updateProfile(
    findOneDto: FindOneDto,
    profileUpdateDto,
    type: AuthConstants
  ): Observable<BaseResponse> {
    const repository = this.getRepository(type);
    const messageType = this.getMessageType(type);

    return from(
      repository.findOne({
        where: { id: findOneDto.id, isDeleted: false, isActive: true, isEmailVerified: false },
      })
    ).pipe(
      switchMap((thisEntity) => {
        if (!thisEntity) {
          throw new RpcException({
            status: status.NOT_FOUND,
            message: messageType.NOT_FOUND2,
          });
        }

        if (type === AuthConstants.user) {
          this.logger.log(`Sending update_user_profile event for "${thisEntity.id}".`);

          return this.clientUser.send<BaseResponse>('update_user_profile', {
            id: thisEntity.id,
            request: profileUpdateDto,
          }).pipe(
            map((response) => {
              if (!response) {
                throw new RpcException('No response from Users service');
              }
              return {
                ... response
              };
            })
          );
        } else if (type === AuthConstants.admin) {
          this.logger.log(`Sending update_admin_profile event for "${thisEntity.id}".`);

          return this.clientAdmin.send<BaseResponse>('update_admin_profile', {
            id: thisEntity.id,
            request: profileUpdateDto,
          }).pipe(
            map((response) => {
              if (!response) {
                throw new RpcException('No response from Admins service');
              }
              return {
                ... response
              };
            })
          );
        }
      }),
      catchError((err) => {
        this.logger.error(
          `${type + 'Repo'}: Failed to update the entity with id "${findOneDto.id}". Error: ${err.message}`
        );
        throw new RpcException({
          code: status.INTERNAL,
          message: messageType.FAILED_TO_UPDATE,
        });
      })
    );
  }


  removeProfile(findOneDto: FindOneDto, type: AuthConstants): Observable<Empty>{
    // const {id} = findOneDto;
    const repository = this.getRepository(type);
    const messageType = this.getMessageType(type);
    this.logger.log(`Incoming ID for removal: ${findOneDto.id}`);

    return from(repository.findOne({where: {id: findOneDto.id}})).pipe(
      switchMap((thisEntity)=>{
        if (!thisEntity){
          this.logger.error(`${type + 'Repo'}: Entity not found for ID: ${findOneDto.id}.`);
          throw new RpcException({
            status: status.NOT_FOUND,
            message: messageType.NOT_FOUND2
          })
        }
        this.logger.log(`${type + 'Repo'}: Attempting to remove entity with ID: ${findOneDto.id}...`);this.logger.log(`${type + 'Repo'}: Attempting to remove entity with ID: ${findOneDto.id}...`);
        return from(repository.remove(thisEntity)).pipe(
          map(()=>{
            this.logger.log(`${type + 'Repo'}: Entity with ID: ${findOneDto.id} removed successfully.`);

            if (type === AuthConstants.user){
              this.logger.log(`Emitting delete_user_profile event for "${thisEntity.id}".`);
              this.clientUser.emit('delete_user_profile', {id: findOneDto.id})
            }else if (type === AuthConstants.admin){
              /////////////////////////////////////////// later //////////////////////////
            }
            return {
              result:{
                status: HttpStatus.OK,
                message: messageType.REMOVED_SUCCESSFULLY
              }
            }
          }),
          catchError((error) => {
            this.logger.error(`${type + 'Repo'}: Failed to remove entity with ID: ${findOneDto.id}. Error: ${error.message}`);
            throw new RpcException({
              code: status.INTERNAL,
              message: messageType.FAILED_REMOVE
            });
          })
        )
      })
    )
  }

  getAllEntities(type: AuthConstants):Observable<T> {
    const repository = this.getRepository(type);
    const messageType = this.getMessageType(type);
    this.logger.log(`trying to get all Entities..`);
    return from(repository.find()).pipe(
      map((entities) => {
        this.logger.log('All Entities profiles fetched successfully');
        return {entities: entities.map(entity => this.mapResponse(entity))} as T;
      }),
      catchError((error) => {
        this.logger.error(`Error fetching all Entities' profiles. Error: ${error.message}`);
        throw new RpcException({
          status: status.INTERNAL,
          message: messageType.FAILED_FETCH,
        });
      })
    );
  }


  protected getRepository(type: AuthConstants): Repository<AdminEntity | UserEntity> {
    this.logger.log(`getRepository called with type: ${type}`);
    if (type === AuthConstants.admin) {
      return this.adminRepository;
    } else if (type === AuthConstants.user) {
      return this.userRepository;
    } else {
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Invalid type provided.',
      });
    }
  }

  protected getMessageType(type: AuthConstants): any {
    this.logger.log(`getMessageType called with type: ${type}`);
    if (type === AuthConstants.admin) {
      return messages.ADMIN;
    } else if (type === AuthConstants.user) {
      return messages.USER;
    } else {
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Invalid type provided.',
      });
    }
  }

  //this is only for refreshtokenrepository
  protected getCondition(type: AuthConstants, condition: Record<string, any>, value: Object): Record<string, any> {
    this.logger.log(`getCondition called with type: ${type}, condition: ${JSON.stringify(condition)}, value: ${JSON.stringify(value)}`);
    if (type === AuthConstants.admin) {
      condition[AuthConstants.admin] = value;
    } else if (type === AuthConstants.user) {
      condition[AuthConstants.user] = value;
    } else {
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Invalid type provided.',
      });
    }
    return condition;
  }

  protected abstract mapResponse(entity: UserEntity | AdminEntity): E;
}
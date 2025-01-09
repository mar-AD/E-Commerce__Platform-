import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RmqContext, RpcException } from '@nestjs/microservices';
import {
  BaseResponse,
  GetAllUserProfilesResponse,
  GetUserProfileRequest,
  GetUserProfileResponse,
  LoggerService,
  messages, UserProfile,
} from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from './entities/users.entity';
import { Repository } from 'typeorm';
import { catchError, from, map, Observable } from 'rxjs';
import { status } from '@grpc/grpc-js';
import { UpdateUserProfileDto } from '@app/common/dtos';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity) private readonly usersRepository: Repository<UsersEntity>,
    private readonly logger: LoggerService
  ) {
  }

  async registerUserProfile( data: {userId: string}, context: RmqContext): Promise<void> {
    const {userId}=data;
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    try {
      this.logger.log(`creating user profile corresponding to user ${userId}`);
      await this.usersRepository.save({ userId })
      this.logger.log(`user profile created successfully with ${userId}`);
      channel.ack(originalMessage);
    }
    catch (error) {
      this.logger.error(`Failed to create user profile with ${userId}: ${error}`);
      channel.nack(originalMessage, false, true);
      throw new RpcException('User creation failed');
    }
  }

  getUsersProfile(request: GetUserProfileRequest): Observable<GetUserProfileResponse>{
    this.logger.log(`Getting users profile with ${request.userId}`);
    return from(this.usersRepository.findOne({where: { userId: request.userId }})).pipe(
      map((thisUser)=>{
        if (!thisUser){
          this.logger.error(`user profile with "${request.userId}" not found`);
          throw new RpcException({
            status: status.NOT_FOUND,
            message: messages.USER.NOT_FOUND2
          })
        }
        this.logger.log('user profile fetched successfully');
        return this.mapUsersProfileResponse(thisUser);
      }),
      catchError((error) => {
        this.logger.error(`error fetching user profile "${request.userId}". Error: ${error.message}`);
        throw new RpcException({
          status: status.INTERNAL,
          message: messages.USER.FAILED_TO_FETCH
        })
      })
    )
  }

  getAllUsersProfiles(): Observable<GetAllUserProfilesResponse> {
    this.logger.log(`Getting all users' profiles`);
    return from(this.usersRepository.find()).pipe(
      map((users) => {
        this.logger.log('All users profiles fetched successfully');
        return { profiles: users.map(user => this.mapUsersProfilesResponse(user)) };
      }),
      catchError((error) => {
        this.logger.error(`Error fetching all users' profiles. Error: ${error.message}`);
        throw new RpcException({
          status: status.INTERNAL,
          message: messages.USER.FAILED_FETCH,
        });
      })
    );
  }

  async updateUserProfile( data:{id: string, request: UpdateUserProfileDto }, context: RmqContext): Promise<BaseResponse> {
    this.logger.log('getting the user profile by userId')
    const {id, request} = data;
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      const thisUser = await this.usersRepository.findOne({where: { userId: id }});
      if (!thisUser){
        this.logger.log(`user profile with ${id} not found`);
        throw new RpcException({
          status: status.NOT_FOUND,
          message: messages.USER.NOT_FOUND2
        })
      }
      const updatedFields = {}
      for (const key of ['profilePic', 'firstName', 'lastName', 'phoneNumber', 'address']) {
        if (request[key] !== undefined && request[key] !== thisUser[key]) {
          updatedFields[key] = request[key];
        }
      }

      if (Object.keys(updatedFields).length > 0) {
        Object.assign(thisUser, updatedFields);
        await this.usersRepository.save(thisUser)
        this.logger.log(`user profile updated successfully with ${id}`);
      }else{
        this.logger.log(`No changes detected for user profile with id: ${id}`);
        return {
          status: HttpStatus.OK,
          message: 'No changes detected for user profile'
        }
      }
      channel.ack(originalMessage)
      return {
        status: HttpStatus.OK,
        message: messages.USER.USER_UPDATED_SUCCESSFULLY
      }
    }
    catch(error) {
      this.logger.error(`Failed to update user profile with ${id}: ${error}`);
      channel.nack(originalMessage, false, true);
      throw new RpcException('User profile update failed');
    }

  }

  async removeUserProfile(data: { id: string }, context: RmqContext): Promise<void> {
    const { id } = data;
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      const result = await this.usersRepository.delete({ userId: id });
      if (result.affected === 0) {
        throw new RpcException({
          status: status.NOT_FOUND,
          message: messages.USER.NOT_FOUND2,
        });
      }
      this.logger.log(`Successfully deleted user profile with userId: ${id}`);
      channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(`Failed to delete user profile with userId: ${id}: ${error}`);
      channel.nack(originalMessage, false, true);
      throw new RpcException('User profile removal failed');
    }
  }


  mapUsersProfileResponse (users: UsersEntity): GetUserProfileResponse {
    return {
      profilePic: users.profilePic,
      firstName: users.firstName,
      lastName: users.lastName,
      phoneNumber: users.phoneNumber,
      address: users.address,
    }
  }

  mapUsersProfilesResponse (users: UsersEntity): UserProfile {
    return {
      userId: users.userId,
      profilePic: users.profilePic,
      firstName: users.firstName,
      lastName: users.lastName,
      phoneNumber: users.phoneNumber,
      address: users.address,
    }
  }

}

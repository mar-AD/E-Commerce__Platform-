import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RmqContext, RpcException } from '@nestjs/microservices';
import {
  GetAllUserProfilesResponse,
  GetUserProfileRequest,
  GetUserProfileResponse,
  LoggerService,
  messages,
} from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from './entities/users.entity';
import { Repository } from 'typeorm';
import { catchError, from, map, Observable } from 'rxjs';
import { status } from '@grpc/grpc-js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity) private readonly usersRepository: Repository<UsersEntity>,
    @Inject('RMQ_CONSUMER') private readonly client: ClientProxy,
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
    return from(this.usersRepository.findOne({where: request.userId})).pipe(
      map((thisUser)=>{
        if (!thisUser){
          this.logger.error(`user profile with "${request.userId}" not found`);
          throw new RpcException({
            status: status.NOT_FOUND,
            message: messages.USER.NOT_FOUND2
          })
        }
        this.logger.log('user profile fetched successfully');
        return thisUser;
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
        return users;
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


}

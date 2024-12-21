import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RmqContext, RpcException } from '@nestjs/microservices';
import { LoggerService, messages } from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from './entities/users.entity';
import { Repository } from 'typeorm';

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


}

 import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME, USERS_PACKAGE_NAME } from '@app/common';
import { join } from 'path';
import { AUTH_SERVICE, USERS_SERVICE } from '../constants';

@Module({
  imports:[
    ClientsModule.register([
      {
        name: USERS_SERVICE,
        transport: Transport.GRPC,
        options:{
          package: USERS_PACKAGE_NAME,
          protoPath: join(__dirname, '../proto/users.proto'),
          url: 'users:50053',
        }
      },
      {
        name: AUTH_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: AUTH_PACKAGE_NAME,
          protoPath: join(__dirname, '../proto/auth.proto'),
          url: 'auth:50051',
        },
      },
    ])
  ],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}

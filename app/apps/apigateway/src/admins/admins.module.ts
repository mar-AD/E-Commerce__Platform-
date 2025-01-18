import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ADMINS_PACKAGE_NAME, AUTH_PACKAGE_NAME } from '@app/common';
import { ADMINS_SERVICE, AUTH_SERVICE } from '../constants';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';

@Module({
  imports:[
    ClientsModule.register([
      {
        name: ADMINS_SERVICE,
        transport: Transport.GRPC,
        options:{
          package: ADMINS_PACKAGE_NAME,
          protoPath: join(__dirname, '../proto/admins.proto'),
          url: 'admins:50055',
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
  providers: [AdminsService],
  controllers: [AdminsController]
})
export class AdminsModule {}

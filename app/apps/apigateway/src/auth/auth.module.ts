import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { AdminService } from './services/admin.service';
import { RolesService } from './services/roles.service';
import { UserController } from './controllers/user.controller';
import { AdminController } from './controllers/admin.controller';
import { RolesController } from './controllers/roles.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME } from '@app/common';
import { join } from 'path';
import { AUTH_SERVICE } from './constants';
import { APP_FILTER } from '@nestjs/core';
import { GrpcServerExceptionFilter } from 'nestjs-grpc-exceptions';

@Module({
  imports: [
    ClientsModule.register([
      {
      name: AUTH_SERVICE,
      transport: Transport.GRPC,
      options: {
        package: AUTH_PACKAGE_NAME,
        protoPath: join(__dirname, '../proto/auth.proto'),
        url: 'auth:50051',
      },
      },
    ]),
  ],
  controllers: [UserController, AdminController, RolesController],
  providers: [UserService, AdminService, RolesService,
    {
      provide: APP_FILTER,
      useClass: GrpcServerExceptionFilter,
    }
  ],
})
export class AuthModule {}

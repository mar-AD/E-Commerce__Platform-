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

@Module({
  imports: [
    ClientsModule.register([
      {
      name: AUTH_SERVICE,
      transport: Transport.GRPC,
      options: {
        package: AUTH_PACKAGE_NAME,
        protoPath: join(__dirname, '../auth.proto'),
      },
      },
    ]),
  ],
  controllers: [UserController, AdminController, RolesController],
  providers: [UserService, AdminService, RolesService],
})
export class AuthModule {}

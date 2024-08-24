import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AdminsModule } from './admins/admins.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [UsersModule, AdminsModule, RolesModule],
  controllers: [],
  providers: [],
})
export class AuthModule {}

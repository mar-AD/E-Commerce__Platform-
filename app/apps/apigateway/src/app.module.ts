import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '@app/common';
import { UsersModule } from './users/users.module';
import { AdminsModule } from './admins/admins.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    AuthModule,
    CommonModule,
    UsersModule,
    AdminsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

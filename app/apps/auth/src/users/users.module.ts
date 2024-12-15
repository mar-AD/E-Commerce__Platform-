import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { EmailVerificationCodeEntity } from '../entities/email-verification-code.entity';
import { CommonModule } from '@app/common';
import { AdminEntity } from '../admins/entities/admin.entity';

@Module({
  imports:[
    CommonModule,
    forwardRef(() => AuthModule),
     TypeOrmModule.forFeature([UserEntity,AdminEntity, RefreshTokenEntity, EmailVerificationCodeEntity]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

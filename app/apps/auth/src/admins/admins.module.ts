import { forwardRef, Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { AuthModule } from '../auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { EmailVerificationCodeEntity } from '../entities/email-verification-code.entity';
import { AdminEntity } from './entities/admin.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { CommonModule } from '@app/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as process from 'node:process';

@Module({
  imports:[
    CommonModule,
    forwardRef(() => AuthModule),
     TypeOrmModule.forFeature([AdminEntity,UserEntity, RefreshTokenEntity, EmailVerificationCodeEntity, RoleEntity]),
    ClientsModule.register([
      {
        name: 'RMQ_CLIENT',
        transport: Transport.RMQ,
        options:{
          urls: [process.env.RABBITMQ_URL],
          queue:process.env.RABBITMQ_EMAIL_QUEUE,
          queueOptions:{
            durable: true,
          }
        }
      }
    ])
  ],
  controllers: [AdminsController],
  providers: [AdminsService],
})
export class AdminsModule {}

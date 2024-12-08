import { forwardRef, Logger, Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AdminsModule } from './admins/admins.module';
import { RolesModule } from './roles/roles.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminEntity } from './admins/entities/admin.entity';
import { RoleEntity } from './roles/entities/role.entity';
import { UserEntity } from './users/entities/user.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CommonModule } from '@app/common';
import { EmailVerificationCodeEntity } from './entities/email-verification-code.entity';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        './apps/auth/.env',
        './.env'
      ]
    }),

    forwardRef(() => UsersModule),
    forwardRef(() => AdminsModule),
    forwardRef(() => RolesModule),
    CommonModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),

      inject: [ConfigService],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('POSTGRES_AUTH_URI'),
        autoLoadEntities: true,
        synchronize: false,
      }),
      // useFactory:() =>({
      //   ...dataSourceOptions,
      //   synchronize: false,
      //   autoLoadEntities: true
      // }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([AdminEntity, RoleEntity, UserEntity, RefreshTokenEntity, EmailVerificationCodeEntity])
  ],
  controllers: [],
  providers: [
    {
      provide: 'RMQ_CLIENT',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_EMAIL_QUEUE'),
            queueOptions: {
              durable: true,
            },
            persistent: true,
          }
        })
      },
      inject:[ConfigService],
    }
  ],
  exports:['RMQ_CLIENT']
})
export class AuthModule {}

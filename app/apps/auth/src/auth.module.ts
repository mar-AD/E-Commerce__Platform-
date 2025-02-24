// import { forwardRef, Module } from '@nestjs/common';
// // import { UsersModule } from './users/users.module';
// // import { AdminsModule } from './admins/admins.module';
// // import { RolesModule } from './roles/roles.module';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { AdminEntity } from './admins/entities/admin.entity';
// import { RoleEntity } from './roles/entities/role.entity';
// import { UserEntity } from './users/entities/user.entity';
// import { RefreshTokenEntity } from './entities/refresh-token.entity';
// import { PassportModule } from '@nestjs/passport';
// import { JwtModule } from '@nestjs/jwt';
// import { CommonModule, LoggerService } from '@app/common';
// import { EmailVerificationCodeEntity } from './entities/email-verification-code.entity';
// import { ClientProxyFactory, Transport } from '@nestjs/microservices';
// import { RolesController } from './roles/roles.controller';
// import { AdminController } from '../../apigateway/src/auth/controllers/admin.controller';
// import { UsersController } from './users/users.controller';
// import { AdminService } from '../../apigateway/src/auth/services/admin.service';
// import { UserService } from '../../apigateway/src/auth/services/user.service';
// import { RolesService } from './roles/roles.service';
//
// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//       envFilePath: [
//         './apps/auth/.env',
//         './.env'
//       ]
//     }),
//
//     // forwardRef(() => UsersModule),
//     // forwardRef(() => AdminsModule),
//     // forwardRef(() => RolesModule),
//     CommonModule,
//     PassportModule,
//     JwtModule.registerAsync({
//       useFactory: async (configService: ConfigService) => ({
//         secret: configService.get<string>('JWT_SECRET'),
//       }),
//
//       inject: [ConfigService],
//     }),
//
//     TypeOrmModule.forRootAsync({
//       imports: [ConfigModule],
//       useFactory: (configService: ConfigService) => ({
//         type: 'postgres',
//         url: configService.get('POSTGRES_AUTH_URI'),
//         autoLoadEntities: true,
//         synchronize: false,
//       }),
//       // useFactory:() =>({
//       //   ...dataSourceOptions,
//       //   synchronize: false,
//       //   autoLoadEntities: true
//       // }),
//       inject: [ConfigService],
//     }),
//     TypeOrmModule.forFeature([AdminEntity, RoleEntity, UserEntity, RefreshTokenEntity, EmailVerificationCodeEntity])
//   ],
//   controllers: [UsersController, AdminController, RolesController],
//   providers: [
//     AdminService,
//     UserService,
//     RolesService,
//     {
//       provide: 'RMQ_CLIENT',
//       useFactory: (configService: ConfigService) => {
//         return ClientProxyFactory.create({
//           transport: Transport.RMQ,
//           options: {
//             urls: [configService.get<string>('RABBITMQ_URL')],
//             queue: configService.get<string>('RABBITMQ_EMAIL_QUEUE'),
//             queueOptions: {
//               durable: true,
//             },
//             persistent: true,
//           }
//         })
//       },
//       inject:[ConfigService],
//     },
//   ],
//   exports:['RMQ_CLIENT']
// })
// export class AuthModule {}


import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

import { AdminEntity } from './admins/entities/admin.entity';
import { UserEntity } from './users/entities/user.entity';
import { RoleEntity } from './roles/entities/role.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { EmailVerificationCodeEntity } from './entities/email-verification-code.entity';
import { UsersController } from './users/users.controller';
import { AdminsController } from './admins/admins.controller';
import { RolesController } from './roles/roles.controller';
import { AdminsService } from './admins/admins.service';
import { UsersService } from './users/users.service';
import { RolesService } from './roles/roles.service';
import { CommonModule, CronService, JwtTokenService, LoggerService } from '@app/common';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['./apps/auth/.env', './.env'],
    }),
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
  controllers: [UsersController, AdminsController, RolesController],
  providers: [
    AdminsService,
    UsersService,
    RolesService,
    LoggerService,
    JwtTokenService,
    CronService,
    {
      provide: 'RMQ_EMAIL_CLIENT',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_EMAIL_QUEUE'),
            queueOptions: { durable: true },
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'RMQ_USERS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_USERS_QUEUE'),
            queueOptions: { durable: true },
          },
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'RMQ_ADMINS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_ADMINS_QUEUE'),
            queueOptions: { durable: true },
          },
        });
      },
      inject: [ConfigService],
    }
  ],
  exports: [
    LoggerService,
    JwtTokenService,
    CronService,
    'RMQ_EMAIL_CLIENT',
    'RMQ_USERS_CLIENT',
    'RMQ_ADMINS_CLIENT'
  ],
})
export class AuthModule {}

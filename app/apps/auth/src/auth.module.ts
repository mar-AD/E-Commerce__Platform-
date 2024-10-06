import { Module } from '@nestjs/common';
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
import { CommonModule, JwtStrategy } from '@app/common';
import { BaseService } from './auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        './apps/auth/.env',
        './.env'
      ]
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
        synchronize: true,
      }),
      // useFactory:() =>({
      //   ...dataSourceOptions,
      //   synchronize: false,
      //   autoLoadEntities: true
      // }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([AdminEntity, RoleEntity, UserEntity, RefreshTokenEntity]),
    UsersModule, AdminsModule, RolesModule
  ],
  controllers: [],
  providers: [JwtStrategy, BaseService],
})
export class AuthModule {}

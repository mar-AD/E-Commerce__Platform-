import { forwardRef, Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { AuthModule } from '../auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from './entities/role.entity';
import { CommonModule } from '@app/common';

@Module({
  imports:[
    CommonModule,
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([RoleEntity])
  ],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}

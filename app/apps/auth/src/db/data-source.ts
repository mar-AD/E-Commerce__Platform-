import { DataSource, DataSourceOptions } from 'typeorm';
import * as process from 'node:process';
import { AdminEntity } from '../admins/entities/admin.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { UserEntity } from '../users/entities/user.entity';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_AUTH_URI,
  entities: [AdminEntity, RoleEntity, UserEntity, RefreshTokenEntity],
  migrations: ['src/db/migrations/*.ts'],
}
export const dataSource = new DataSource(dataSourceOptions);
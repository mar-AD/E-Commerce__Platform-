// import * as dotenv from 'dotenv';
//
// // Load environment variables from the .env file
// dotenv.config({ path: './apps/auth/.env' });
import { DataSource, DataSourceOptions } from 'typeorm';
import * as process from 'node:process';
import { AdminEntity } from '../admins/entities/admin.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { UserEntity } from '../users/entities/user.entity';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_AUTH_HOST,
  POSTGRES_AUTH_DB,
  POSTGRES_AUTH_PORT,
} = process.env;

console.log({
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_AUTH_HOST,
  POSTGRES_AUTH_DB,
  POSTGRES_AUTH_PORT,
});


const url = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_AUTH_HOST}:${POSTGRES_AUTH_PORT}/${POSTGRES_AUTH_DB}`;

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: url,
  entities: [AdminEntity, RoleEntity, UserEntity, RefreshTokenEntity],
  migrations: ['./apps/auth/src/db/migrations/*.ts'],
}
export const dataSource = new DataSource(dataSourceOptions);
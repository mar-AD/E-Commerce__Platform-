import { DataSource, DataSourceOptions } from 'typeorm';
import * as process from 'node:process';
import { UsersEntity } from '../entities/users.entity';

export const dataSourceOptions : DataSourceOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_USERS_URI,
  entities: [UsersEntity],
  migrations: ['./apps/users/src/db/migrations/*.ts']
}

export const dataSource = new DataSource(dataSourceOptions)
import { DataSource, DataSourceOptions } from 'typeorm';
import * as process from 'node:process';

export const dataSourceOptions : DataSourceOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_USERS_URI,
  entities: null,//will be added
  migrations: ['./apps/users/src/db/migrations/*.ts']
}

export const dataSource = new DataSource(dataSourceOptions)
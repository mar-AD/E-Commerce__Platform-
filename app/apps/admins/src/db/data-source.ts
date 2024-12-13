import { DataSource, DataSourceOptions } from 'typeorm';
import * as process from 'node:process';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_ADMINS_URI,
  entities: undefined, //will add entities when I create them
  migrations: ['./apps/admins/src/db/migrations/*.ts'],
}

export const dataSource = new DataSource(dataSourceOptions);
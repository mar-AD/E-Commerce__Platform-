import { DataSource, DataSourceOptions } from 'typeorm';
import * as process from 'node:process';
import { AdminsEntity } from '../entities/admins.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_ADMINS_URI,
  entities: [AdminsEntity],
  migrations: ['./apps/admins/src/db/migrations/*.ts'],
}

export const dataSource = new DataSource(dataSourceOptions);
import { DataSource, DataSourceOptions } from 'typeorm';
import * as process from 'node:process';
import { OrdersEntity } from '../entities/orders.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_ORDERS_URI,
  entities: [OrdersEntity],
  migrations: ['./apps/orders/src/db/migrations/*.ts']
}

export const dataSource = new DataSource(dataSourceOptions);
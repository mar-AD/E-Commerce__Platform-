import { DataSource, DataSourceOptions } from 'typeorm';
import { ProductEntity } from '../core-products/entities/products.entity';
import { CustomProductsEntity } from '../custom-products/entities/Custom_Products.entity';
import { UserStoreEntity } from '../user-stores/entities/user_store.entity';
import * as process from 'node:process';


export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_PRODUCTS_URI,
  entities: [ProductEntity, CustomProductsEntity, UserStoreEntity],
  migrations: ['./apps/products/src/db/migrations/*.ts']
}

export const dataSource = new DataSource(dataSourceOptions);
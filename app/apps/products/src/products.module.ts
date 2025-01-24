import { Module } from '@nestjs/common';
import { ProductsService } from './core-products/products.service';
import { ProductsController } from './core-products/products.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from '@app/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './core-products/entities/products.entity';
import { CustomProductsEntity } from './custom-products/entities/Custom_Products.entity';
import { UserStoreEntity } from './user-stores/entities/user_store.entity';
import { CustomProductsController } from './custom-products/custom-products.controller';
import { UserStoresController } from './user-stores/user-stores.controller';
import { CustomProductsService } from './custom-products/custom-products.service';
import { UserStoresService } from './user-stores/user-stores.service';

@Module({
  imports: [
    ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: ['./apps/products/.env', './.env']
  }),
    CommonModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('POSTGRES_PRODUCTS_URI'),
        autoLoadEntities: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([ProductEntity, CustomProductsEntity, UserStoreEntity]),
  ],
  controllers: [ProductsController, CustomProductsController, UserStoresController],
  providers: [ProductsService, CustomProductsService, UserStoresService],
})
export class ProductsModule {}

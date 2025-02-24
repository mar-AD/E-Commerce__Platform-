import { Module } from '@nestjs/common';
import { ProductsService } from './core-products/products.service';
import { ProductsController } from './core-products/products.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from '@app/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './core-products/entities/products.entity';
import { CustomProductsEntity } from './custom-products/entities/Custom_Products.entity';
import { UserStoreEntity } from './user-stores/entities/user_store.entity';
import { CustomProductController } from './custom-products/custom-products.controller';
import { UserStoresController } from './user-stores/user-stores.controller';
import { CustomProductsService } from './custom-products/custom-products.service';
import { UserStoresService } from './user-stores/user-stores.service';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

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
  controllers: [ProductsController, CustomProductController, UserStoresController],
  providers: [
    ProductsService,
    CustomProductsService,
    UserStoresService,
    {
      provide: 'RMQ_AUTH_CLIENT',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_AUTH_QUEUE'),
            queueOptions: { durable: true },
          },
        });
      },
      inject: [ConfigService],
    }
  ],
  exports:['RMQ_AUTH_CLIENT'],
})
export class ProductsModule {}

import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from '@app/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/products.entity';
import { CustomProductsEntity } from './entities/Custom_Products.entity';
import { UserStoreEntity } from './entities/user_store.entity';

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
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}

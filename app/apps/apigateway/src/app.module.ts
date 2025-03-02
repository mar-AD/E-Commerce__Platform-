import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '@app/common';
import { UsersModule } from './users/users.module';
import { AdminsModule } from './admins/admins.module';
import { ProductsModule } from './products/products.module';
import { OrdersService } from './orders/orders.service';
import { OrdersController } from './orders/orders.controller';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    CommonModule,
    AuthModule,
    UsersModule,
    AdminsModule,
    ProductsModule,
    OrdersModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class AppModule {}

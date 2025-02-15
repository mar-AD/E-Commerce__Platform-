import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrdersEntity } from './entities/orders.entity';
import { Repository } from 'typeorm';
import {
  dateToTimestamp,
  LoggerService,
  messages,
  OrderResponse,
  OrdersListResponse,
  PaginationRequest,
} from '@app/common';
import { catchError, from, map, Observable, switchMap } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrdersEntity) private readonly ordersRepository: Repository<OrdersEntity>,
    private readonly logger: LoggerService,
  ) {
  }

  getAllOrders(request: Observable<PaginationRequest>): Observable<OrdersListResponse> {
    return from(request).pipe(
      switchMap(({ page, limit }) => {
        this.logger.log(`Fetching orders with pagination - Page: ${page}, Limit: ${limit}`);

        return from(this.ordersRepository.findAndCount({
          skip: (page - 1) * limit,
          take: limit,
        })).pipe(
          map(([orders, count]) => {
            this.logger.log(`Successfully fetched ${orders.length} orders (Total: ${count})`);

            return {
              orders: orders.map((order) => this.mappedResponse(order)),
              total: count
            };
          }),
          catchError((err) => {
            this.logger.error(`Failed to fetch orders. Error: ${err.message}`);

            throw new RpcException({
              code: status.INTERNAL,
              message: messages.ORDERS.FAILED_TO_FETCH_ALL_ORDERS
            });
          })
        );
      })
    );
  }


  mappedResponse(order: OrdersEntity): OrderResponse{
    return {
      id: order.id,
      userId: order.userId,
      products: order.products,
      totalPrice: order.totalPrice,
      status: order.status,
      createdAt: dateToTimestamp(order.createdAt),
      updatedAt: dateToTimestamp(order.updatedAt)
    }
  }
}

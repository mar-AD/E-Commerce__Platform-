import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrdersEntity } from './entities/orders.entity';
import { Repository } from 'typeorm';
import {
  dateToTimestamp, getDeliveryDate, getDeliveryType, GetOrderByIdRequest, GetOrdersByUserIdRequest,
  LoggerService,
  messages, OrderBaseResponse,
  OrderResponse,
  OrdersListResponse,
  PaginationRequest, timestampToDate,
} from '@app/common';
import { catchError, from, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { CreateOrderDto } from '@app/common/dtos';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrdersEntity) private readonly ordersRepository: Repository<OrdersEntity>,
    @Inject('RMQ_USERS_CLIENT') private readonly clientUsers: ClientProxy,
    @Inject('RMQ_EMAIL_CLIENT') private readonly clientEmail: ClientProxy,
    @Inject('RMQ_AUTH_CLIENT') private readonly clientAuth: ClientProxy,
    private readonly logger: LoggerService,
  ) {
  }

  create(getUser: GetOrdersByUserIdRequest, createOrderDto: CreateOrderDto): Observable<OrderResponse> {
    const { userId } = getUser;

    this.logger.debug(`Sending get_one_user message for user "${userId}"`);
    return this.clientAuth.send<string>('get_one_user', { id: userId }).pipe(
      switchMap((userExists) => {
        if (!userExists) {
          this.logger.warn(`User with ID "${userId}" not found.`);
          throw new RpcException({
            code: status.NOT_FOUND,
            message: messages.USER.NOT_FOUND2
          });
        }
        const email = userExists;

        this.logger.debug(`Sending get_user_profile message for user "${userId}"`);
        return this.clientUsers.send('get_user_profile', { id: userId }).pipe(
          switchMap((profileExists) => {
            if (!profileExists) {
              this.logger.warn(`User profile for ID "${userId}" not found.`);
              throw new RpcException({
                code: status.NOT_FOUND,
                message: messages.USER.NOT_FOUND2
              });
            }
            const type = getDeliveryType(createOrderDto.deliveryDate)
            const deliveryDate = getDeliveryDate(type);

            const { firstName, lastName, address } = profileExists;
            const customerName = `${firstName} ${lastName}`;
            const createOrder = { userId, deliveryDate, ...createOrderDto };

            this.logger.log(`Placing order for User ID: "${userId}"`);
            return from(this.ordersRepository.save(createOrder)).pipe(
              tap((createdOrder) => {
                // Emit email event as a side effect
                this.clientEmail.emit('place_order_email', {
                  email,
                  orderId: createdOrder.id,
                  customerName,
                  orderDate: createdOrder.createdAt,
                  orderTotal: createdOrder.totalPrice,
                  customerAddress: address,
                  deliveryDate: createdOrder.deliveryDate,
                  items: createdOrder.products
                }).pipe(
                  tap(() => {
                    this.logger.log(`Successfully emitted place_order_email event for ${email}.`);
                  }),
                  catchError((err) => {
                    this.logger.error(
                      `Failed to emit place_order_email event for ${email}. Error: ${err.message}`
                    );
                    return of(null);
                  })
                ).subscribe();
              }),
              map((createdOrder) => this.mappedResponse(createdOrder)),
              catchError((err) => {
                this.logger.error(`Failed to place order: ${err.message}`);
                return throwError(() => new RpcException({
                  code: status.INTERNAL,
                  message: messages.ORDERS.FAILED_TO_PLACE_ORDER
                }));
              })
            );
          })
        );
      })
    );
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

  getOneOrder(request: GetOrderByIdRequest): Observable<OrderResponse> {
    const{orderId} = request;
    this.logger.log(`OrdersRepo: Searching for entity by ID "${orderId}" in repository...'`);
    return from(this.ordersRepository.findOne({where: {id: orderId}})).pipe(
      map((order)=>{
        if (!order){
          this.logger.error(`OrdersRepo: order with ID "${orderId}" not found'`);
          throw new RpcException({
            code: status.NOT_FOUND,
            message: messages.ORDERS.ORDER_NOT_FOUND
          })
        }
        this.logger.log(`OrdersRepo: order with ID "${orderId}" found successfully `);
        return this.mappedResponse(order)
      }),
      catchError((error)=>{
        this.logger.error(`OrdersRepo: Failed to fetch order with ID "${orderId}". Error: ${error.message}`);
        throw new RpcException({
          code: status.INTERNAL,
          message: messages.ORDERS.FAILED_TO_FETCH_ORDER
        })
      })
    )
  }

  getOrdersByUser(request: GetOrdersByUserIdRequest): Observable<OrdersListResponse> {
    const{userId} = request;
    this.logger.log(`Orders: sending get_user_id message... '`);
    return this.clientAuth.send<boolean>('get_user_id', {id: userId}).pipe(
      switchMap((userExists) => {
        if (!userExists) {
          this.logger.log(`UserRepo: entity with ID "${userId}" do not exist.`);
          throw new RpcException({
            code: status.NOT_FOUND,
            message: messages.USER.NOT_FOUND2
          });
        }
        this.logger.log(`OrdersRepo: Searching for entity by ID "${userId}" in repository...'`);
        return from(this.ordersRepository.findAndCount({ where: { userId }})).pipe(
          map(([orders, count]) => {
            if (!orders) {
              this.logger.error(`OrdersRepo: order with ID "${userId}" not found'`);
              throw new RpcException({
                code: status.NOT_FOUND,
                message: messages.ORDERS.ORDER_NOT_FOUND
              })
            }
            this.logger.log(`OrdersRepo:order with ID "${userId}" found successfully `);
            return {
              orders: orders.map((product) => this.mappedResponse(product)),
              total: count
            }
          }),
          catchError((error) => {
            this.logger.error(`OrdersRepo: Failed to fetch order with ID "${userId}". Error: ${error.message}`);
            throw new RpcException({
              code: status.INTERNAL,
              message: messages.ORDERS.FAILED_TO_FETCH_ORDER
            })
          })
        )
      })
    )
  }

  cancelOrder(request: GetOrderByIdRequest): Observable<OrderBaseResponse> {
    const{orderId} = request;
    return from(this.ordersRepository.findOne({id: orderId})).pipe(
      switchMap((order)=>{
        if (!order) {
          throw new RpcException({
            code: status.NOT_FOUND,
            message: messages.ORDERS.ORDER_NOT_FOUND,
          });
        }

        const cancelPeriod = order.createdAt + 1800
        if ( )
      }),
      catchError((error)=>{
        this.logger.error(`OrdersRepo: failed to cancel order with ID "${orderId}". Error: ${error.message}`);
        throw new RpcException({
          code: status.INTERNAL,
          message: messages.ORDERS.FAILED_TO_CANCEL_ORDER
        })
      })
    )
  }


  mappedResponse(order: OrdersEntity): OrderResponse{
    return {
      id: order.id,
      userId: order.userId,
      products: order.products,
      totalPrice: order.totalPrice,
      deliveryDate: dateToTimestamp(order.deliveryDate),
      status: order.status,
      createdAt: dateToTimestamp(order.createdAt),
      updatedAt: dateToTimestamp(order.updatedAt)
    }
  }

}

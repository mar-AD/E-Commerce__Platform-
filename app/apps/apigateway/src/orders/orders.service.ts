import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  CreateOrderRequest,
  GetOrderByIdRequest, GetOrdersByUserIdRequest, GetOrdersRequest,
  ORDER_SERVICE_NAME,
  OrderServiceClient, PaginationRequest,
  UpdateOrderStatusRequest,
} from '@app/common';
import { ORDERS_SERVICE } from '../constants';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Injectable()
export class OrdersService implements OnModuleInit {
  private orderService: OrderServiceClient;
  constructor(@Inject(ORDERS_SERVICE) private client: ClientGrpc) {}

  onModuleInit() {
    this.orderService = this.client.getService<OrderServiceClient>(ORDER_SERVICE_NAME)
  }

  create(createOrderRequest: CreateOrderRequest) {
    return this.orderService.createOrder(createOrderRequest)
  }

  update(request: UpdateOrderStatusRequest) {
    return this.orderService.updateOrderStatus(request)
  }

  getOrder(request: GetOrderByIdRequest) {
    return this.orderService.getOrderById(request)
  }

  getOneOrder(request: GetOrdersByUserIdRequest) {
    return this.orderService.getOrdersByUserId(request)
  }

  cancel(request: GetOrdersRequest) {
    return this.orderService.cancelOrder(request)
  }

  getAll(request: Observable<PaginationRequest>) {
    return this.orderService.getAllOrders(request)
  }
}

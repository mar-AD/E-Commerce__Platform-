import { Controller } from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  CreateOrderRequest, GetOrderByIdRequest, GetOrdersByUserIdRequest,
  OrderServiceController,
  OrderServiceControllerMethods, OrdersListResponse, PaginationRequest,
  UpdateOrderStatusRequest,
} from '@app/common';
import { Observable } from 'rxjs';


@Controller()
@OrderServiceControllerMethods()
export class OrdersController implements OrderServiceController{
  constructor(private readonly ordersService: OrdersService) {}

  createOrder(createOrderRequest: CreateOrderRequest) {
    const {getUser, createOrderDto } = createOrderRequest;
    return this.ordersService.create(getUser, createOrderDto)
  }

  updateOrderStatus(request: UpdateOrderStatusRequest){
    const {getOrder, getUser, updateOrderDto} = request;
    return this.ordersService.update(getOrder, getUser, updateOrderDto)
  }

  getOrderById(request: GetOrderByIdRequest) {
    return this.ordersService.getOneOrder(request)
  }

  getOrdersByUserId(request: GetOrdersByUserIdRequest){
    return this.ordersService.getOrdersByUser(request)
  }

  getAllOrders(request: Observable<PaginationRequest>) {
    return this.ordersService.getAllOrders(request)
  }
}

import { Controller } from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  CreateOrderRequest, GetOrderByIdRequest, GetOrdersByUserIdRequest, GetOrdersRequest,
  OrderServiceController,
  OrderServiceControllerMethods, PaginationRequest,
  UpdateOrderStatusRequest,
} from '@app/common';


@Controller()
@OrderServiceControllerMethods()
export class OrdersController implements OrderServiceController{
  constructor(private readonly ordersService: OrdersService) {}

  createOrder(createOrderRequest: CreateOrderRequest) {
    const {getUser, createOrderDto } = createOrderRequest;
    return this.ordersService.create(getUser, createOrderDto)
  }

  updateOrderStatus(request: UpdateOrderStatusRequest){
    const {getOrder, updateOrderDto} = request;
    return this.ordersService.update(getOrder, updateOrderDto)
  }

  getOrderById(request: GetOrderByIdRequest) {
    return this.ordersService.getOneOrder(request)
  }

  getOrdersByUserId(request: GetOrdersByUserIdRequest){
    return this.ordersService.getOrdersByUser(request)
  }

  getAllOrders(request: PaginationRequest) {
    return this.ordersService.getAllOrders(request)
  }

  cancelOrder(request: GetOrdersRequest) {
    return this.ordersService.cancelOrder(request)
  }
}

import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  CreateOrderRequest, GetOrderByIdRequest,
  GetOrdersByUserIdRequest, GetOrdersRequest,
  getPermissionName,
  JwtAuthGuard, PaginationRequest, Permissions,
  PermissionsAndAccess, UpdateOrderStatusRequest,
} from '@app/common';
import { PermissionsGuard } from '../auth/guards/auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from '@app/common/dtos';

@ApiTags('Orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {
  }

  @Post('order')
  @ApiBearerAuth()
  @PermissionsAndAccess({accessType: ['user']})
  createOrder(@Req() req: Request, @Body() createOrderDto: CreateOrderDto) {
    const userId = req['user']['payload'].id;
    const getUser: GetOrdersByUserIdRequest = {userId};
    const createOrderRequest: CreateOrderRequest = {getUser, createOrderDto};

    return this.ordersService.create(createOrderRequest);
  }

  @Patch('update/order/:orderId')
  @ApiBearerAuth()
  @PermissionsAndAccess({accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_ORDERS)})
  updateOrder(@Param('orderId') orderId: string, @Body() updateOrderDto: UpdateOrderStatusDto) {
    const getOrder: GetOrderByIdRequest = {orderId};
    const request: UpdateOrderStatusRequest = {getOrder, updateOrderDto};

    return this.ordersService.update(request);
  }

  @Get('order/:orderId')
  @ApiBearerAuth()
  @PermissionsAndAccess({accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_ORDERS)})
  getOrder(@Param('orderId') orderId: string) {
    const request: GetOrderByIdRequest = {orderId};

    return this.ordersService.getOrder(request);
  }

  @Get('user/orders')
  @ApiBearerAuth()
  @PermissionsAndAccess({accessType: ['user']})
  getOneOrder(@Req() req: Request) {
    const userId = req['user']['payload'].id;
    const request: GetOrdersByUserIdRequest = {userId};

    return this.ordersService.getOneOrder(request);
  }


  @Patch('cancel/order/:orderId')
  @ApiBearerAuth()
  @PermissionsAndAccess({accessType: ['user']})
  cancelOrder(@Req() req: Request, @Param('orderId') orderId: string){
    const userId = req['user']['payload'].id;
    const request: GetOrdersRequest = {userId, orderId};

    return this.ordersService.cancel(request)
  }

  @Get('orders')
  @ApiBearerAuth()
  @ApiQuery({name: 'page', required: false, type: Number})
  @ApiQuery({name: 'limit', required: false, type: Number})
  @PermissionsAndAccess({accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_ORDERS)})
  getAllOrders(@Query('page') page = 1, @Query('limit') limit = 5 ) {
    const request: PaginationRequest = { page, limit};

    return this.ordersService.getAll(request)
  }
}

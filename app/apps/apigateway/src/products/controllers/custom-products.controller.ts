import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateCustomProductRequest,
  CustomProductsByUserRequest,
  GetOne,
  getPermissionName, GetProductId, isPublic,
  JwtAuthGuard, LoggerService,
  Permissions,
  PermissionsAndAccess, StoresByUserRequest, UpdateCustomProductRequest,
} from '@app/common';
import { PermissionsGuard } from '../../auth/guards/auth.guard';
import { CustomProductsService } from '../services/custom-products.service';
import { CreateCustomProductDto, UpdateCustomProductDto } from '@app/common/dtos';
import { Request } from 'express';

@ApiTags('CustomProducts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('CustomProducts')
export class CustomProductsController {
  constructor(private readonly customProductsService: CustomProductsService, private readonly logger: LoggerService) {
  }

  @Post('create/custom/product/:productId')
  @ApiBearerAuth()
  @PermissionsAndAccess({accessType: ['user']})
  createCustomProduct(@Req() req: Request, @Param('productId') productId: string, @Body() createCustomProduct: CreateCustomProductDto) {
    const userId = req['user']['payload'].id;
    const getUser: CustomProductsByUserRequest = {userId};
    const getProduct: GetProductId = { productId };
    const createCProductDto: CreateCustomProductRequest = { getUser, getProduct, createCustomProduct  }
    return this.customProductsService.create(createCProductDto);
  }

  @Patch('/:id')
  @ApiBearerAuth()
  @PermissionsAndAccess({accessType: ['user']})
  updateCustomProduct(@Req() req: Request, @Param('id') id: string, @Body() updateCustomProduct: UpdateCustomProductDto) {
    const userId = req['user']['payload'].id;
    const getUser: CustomProductsByUserRequest = { userId };
    const getOne: GetOne = { id };
    const updateCustomProductRequest : UpdateCustomProductRequest = { getOne, getUser, updateCustomProduct};
    return this.customProductsService.update(updateCustomProductRequest);
  }

  @Get('product/:id')
  @isPublic()
  getOneCustomProduct(@Param('id') id: string) {
    const getOne: GetOne = {id};
    return this.customProductsService.getOneCustomProduct(getOne)
  }

  @Get('user/Custom/products')
  @ApiBearerAuth()
  @PermissionsAndAccess({accessType: ['user']})
  getCustomProductsByUser(@Req() req: Request) {
    const userId = req['user']['payload'].id;
    const customProductsByUserRequest : CustomProductsByUserRequest = {userId}
    return this.customProductsService.getCustomProductsByUser(customProductsByUserRequest)
  }
//for admins in the dashboard
  @Get('admins/user/Custom/products/:id')
  @ApiBearerAuth()
  @PermissionsAndAccess({accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_PRODUCTS)})
  getCustomProductsByUserForAdmins(@Param('id') id: string) {
    const userId = id;
    const customProductsByUserRequest : CustomProductsByUserRequest = {userId}
    return this.customProductsService.getCustomProductsByUser(customProductsByUserRequest)
  }

  @Get('user/store/Custom/products')
  @ApiBearerAuth()
  @PermissionsAndAccess({accessType: ['user']})
  getCustomProductsByStore(@Req() req: Request) {
    const userId = req['user']['payload'].id;
    const storesByUserRequest : StoresByUserRequest = {userId}
    return this.customProductsService.getCustomProductsByStore(storesByUserRequest)
  }

  //for admins in the dashboard
  @Get('admins/user/store/Custom/products/:id')
  @ApiBearerAuth()
  @PermissionsAndAccess({accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_PRODUCTS)})
  getCustomProductsByStoreForAdmins(@Param('id') id: string) {
    const userId = id;
    const storesByUserRequest : StoresByUserRequest = {userId}
    return this.customProductsService.getCustomProductsByStore(storesByUserRequest)
  }

  @Patch('Custom/products/:id')
  @ApiBearerAuth()
  @PermissionsAndAccess({accessType: ['admin', 'user'], permission: getPermissionName(Permissions.MANAGE_PRODUCTS)})
  unpublishCustomProductFromStore(@Param('id') id: string) {
    const getOne: GetOne = {id};
    return this.customProductsService.unpublish(getOne)
  }

  @Delete('remove/:id')
  @ApiBearerAuth()
  @PermissionsAndAccess({accessType: ['admin', 'user'], permission: getPermissionName(Permissions.MANAGE_PRODUCTS)})
  deleteCustomProduct(@Param('id') id: string) {
    const getOne: GetOne = {id};
    return this.customProductsService.removeCustomProduct(getOne)
  }
}

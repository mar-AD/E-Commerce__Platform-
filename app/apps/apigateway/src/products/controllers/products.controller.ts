import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  EmptyRequest,
  GetOne,
  getPermissionName, isPublic,
  JwtAuthGuard,
  Permissions,
  PermissionsAndAccess,
  UpdateProductRequest,
} from '@app/common';
import { PermissionsGuard } from '../../auth/guards/auth.guard';
import { ProductsService } from '../services/products.service';
import { CreateProductDto, UpdateProductDto } from '@app/common/dtos';

@ApiTags('Products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {
  }

  @Post('create/product')
  @ApiBearerAuth()
  @PermissionsAndAccess({accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_PRODUCTS)})
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.CreateProduct(createProductDto);
  }

  @Patch('/:id')
  @ApiBearerAuth()
  @PermissionsAndAccess({accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_PRODUCTS)})
  updateProduct(@Param('id') id: string, @Body() updateProduct: UpdateProductDto) {
    const getOne: GetOne = {id};
    const updateProductRequest: UpdateProductRequest = {getOne, updateProduct};
    return this.productsService.UpdateProduct(updateProductRequest);
  }

  @Get('product/:id')
  @isPublic()
  getOneProduct(@Param('id') id: string) {
    const getOne: GetOne = {id};
    return this.productsService.getOneProduct(getOne)
  }

  @Get('products')
  @isPublic()
  getAllProducts(request: EmptyRequest) {
    return this.productsService.getAllProducts(request)
  }

  @Delete('remove/:id')
  @ApiBearerAuth()
  @PermissionsAndAccess({accessType: ['admin'], permission: getPermissionName(Permissions.MANAGE_PRODUCTS)})
  deleteProduct(@Param('id') id: string) {
    const getOne: GetOne = {id};
    return this.productsService.DeleteProduct(getOne)
  }
}

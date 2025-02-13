import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateStoreRequest,
  GetOne, getPermissionName,
  isPublic,
  JwtAuthGuard, Permissions,
  PermissionsAndAccess, StoresByUserRequest,
  UpdateStoreRequest,
} from '@app/common';
import { PermissionsGuard } from '../../auth/guards/auth.guard';
import { StoreService } from '../services/store.service';
import { Request } from 'express';
import { CreateStoreDto, UpdateStoreDto } from '@app/common/dtos';

@ApiTags('Store')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {
  }

  @Post('create')
  @ApiBearerAuth()
  @PermissionsAndAccess({accessType: ['user']})
  createStore(@Req() req: Request, @Body() createStoreRequestDto: CreateStoreDto) {
    const userId = req['user']['payload'].id;
    const getUser: StoresByUserRequest = {userId};
    const createStoreDto: CreateStoreRequest = {getUser, createStoreRequestDto};
    return this.storeService.createStore(createStoreDto);
  }

  @Patch('/:id')
  @ApiBearerAuth()
  @PermissionsAndAccess({accessType: ['user']})
  updateStore(@Req() req: Request, @Param('id') id: string, @Body() updateStore: UpdateStoreDto) {
    const userId = req['user']['payload'].id;
    const getUser: StoresByUserRequest = { userId };
    const getId: GetOne = { id };
    const updateStoreRequest: UpdateStoreRequest = {getId, getUser, updateStore};
    return this.storeService.updateUserStore(updateStoreRequest);
  }

  @Get('/:id')
  @isPublic()
  getOneStore(@Param('id') id: string) {
    const getOne: GetOne = {id};
    return this.storeService.getOneStore(getOne)
  }

  @Get('my/store')
  @ApiBearerAuth()
  @PermissionsAndAccess({accessType: ['user']})
  getStoreByUser(@Req() req: Request) {
    const userId = req['user']['payload'].id;
    const getUser: StoresByUserRequest = { userId };
    return this.storeService.getStoreByUser(getUser)
  }

  @Get('All/Stores')
  @ApiBearerAuth()
  @isPublic()
  getAllStores(@Query('isActive') isActive: string) {
    const request= isActive === 'true'? {isActive: true}: isActive === 'false'? {isActive: false}: {};
    return this.storeService.getAll(request)
  }

  @Delete('remove/:id')
  @ApiBearerAuth()
  @PermissionsAndAccess({accessType: ['user']})
  deleteStore(@Param('id') id: string) {
    const getOne: GetOne = {id};
    return this.storeService.deleteStore(getOne)
  }
}

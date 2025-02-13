import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  CreateStoreRequest, Filter,
  GetOne,
  StoresByUserRequest,
  UpdateStoreRequest,
  USER_STORE_SERVICE_NAME, UserStoreClient,
} from '@app/common';
import { PRODUCTS_SERVICE } from '../../constants';
import { ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class StoreService implements OnModuleInit{
  private userStoreService: UserStoreClient
  constructor(@Inject(PRODUCTS_SERVICE) private client: ClientGrpc){}

  onModuleInit() {
    this.userStoreService= this.client.getService<UserStoreClient>(USER_STORE_SERVICE_NAME);
  }

  createStore(createProductDto: CreateStoreRequest){
    return this.userStoreService.createStore(createProductDto)
  }

  updateUserStore(updateStoreRequest: UpdateStoreRequest){
    return this.userStoreService.updateStore(updateStoreRequest)
  }

  getOneStore(request: GetOne){
    return this.userStoreService.getStoreById(request)
  }

  getStoreByUser(request: StoresByUserRequest){
    return this.userStoreService.getStoresByUser(request)
  }

  getAll(request: Filter) {
    return this.userStoreService.getAllStores(request)
  }

  deleteStore(request: GetOne){
    return this.userStoreService.deleteStore(request)
  }
}

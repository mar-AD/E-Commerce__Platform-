import { Controller } from '@nestjs/common';
import {
  CreateStoreRequest, Filter,
  GetOne, StoresByUserRequest,
  UpdateStoreRequest,
  UserStoreController,
  UserStoreControllerMethods,
} from '@app/common';
import { UserStoresService } from './user-stores.service';

@Controller('user-stores')
@UserStoreControllerMethods()
export class UserStoresController implements UserStoreController{
  constructor(private readonly userStoreService: UserStoresService) {
  }

  createStore(createStoreRequest: CreateStoreRequest) {
    const {getUser, createStoreRequestDto} = createStoreRequest;
    return this.userStoreService.createUserStore(getUser, createStoreRequestDto);
  }

  updateStore(updateStoreRequest: UpdateStoreRequest) {
    const{getId, getUser, updateStore} = updateStoreRequest;
    return this.userStoreService.updateUserStore(getId, getUser, updateStore);
  }

  getStoreById(request: GetOne){
    return this.userStoreService.getStore(request)
  }

  getStoresByUser(request: StoresByUserRequest){
    return this.userStoreService.getStoreByUserId(request)
  }

  getAllStores(request: Filter) {
    return this.userStoreService.getAll(request)
  }

  deleteStore(request: GetOne) {
    return this.userStoreService.removeStore(request)
  }
}

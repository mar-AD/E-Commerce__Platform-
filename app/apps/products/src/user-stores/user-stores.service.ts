import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStoreEntity } from './entities/user_store.entity';
import { Repository } from 'typeorm';
import {
  BaseProductsResponse,
  dateToTimestamp,
  GetOne,
  LoggerService,
  messages,
  StoreResponse,
  StoresByUserRequest,
} from '@app/common';
import { CreateStoreDto, UpdateStoreDto } from '@app/common/dtos';
import { catchError, from, map, Observable, switchMap, tap } from 'rxjs';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class UserStoresService {
  constructor(
    @InjectRepository(UserStoreEntity) private readonly userStoreRepository: Repository<UserStoreEntity>,
    @Inject('RMQ_PRODUCTS_CLIENT') private readonly clientStore: ClientProxy,
    private readonly logger: LoggerService,
  ) {
  }

  createUserStore(getUser:StoresByUserRequest, createStoreRequestDto: CreateStoreDto): Observable<StoreResponse> {
    const {userId} = getUser;
    this.logger.log(`trying to find a store with user Id "${userId}"`);
    return from(this.userStoreRepository.findOne({where: {userId}})).pipe(
      switchMap(store => {
        if (store) {
          this.logger.warn(`Store with user ID "${userId}" found.`);
          throw new RpcException({
            code: status.ALREADY_EXISTS,
            message: 'You already have a store'
          });
        }
        this.logger.log(`Sending get_user_id message for user "${userId}"`);
        return this.clientStore.send<boolean>('get_user_id', { id: userId }).pipe(
          tap(userExists => {
            if (!userExists) {
              this.logger.warn(`User with ID "${userId}" not found.`);
              throw new RpcException({
                code: status.NOT_FOUND,
                message: messages.USER.NOT_FOUND2
              });
            }
          }),
          switchMap(()=> {
            const newStore = { userId, ...createStoreRequestDto}
            this.logger.log(`Creating store for User ID: "${userId}"`);
            return from(this.userStoreRepository.save(newStore)).pipe(
              map((savedStore) => {
                this.logger.log(`store created successfully`);
                return this.mappedResponse(savedStore)
              }),
              catchError(err => {
                this.logger.error(`Failed to create store: ${err.message}`);
                throw new RpcException({
                  code: status.INTERNAL,
                  message: messages.PRODUCTS.FAILED_TO_CREATE_USER_STORE
                });
              })
            )
          })
        )
      })
    )
  }

  updateUserStore(getId: GetOne, getUser: StoresByUserRequest, updateStore: UpdateStoreDto): Observable<StoreResponse>{
    const {userId} = getUser;
    const { id } = getId;
    this.logger.debug(`UserStoreRepo:trung to find store with ID "${id}"`);
    return from(this.userStoreRepository.findOne({where: {id}})).pipe(
      switchMap(store => {
        if (!store) {
          this.logger.warn(`UserStoreRepo:Store with ID "${id}" not found.`);
          throw new RpcException({
            code: status.NOT_FOUND,
            message: messages.PRODUCTS.USER_STORE_NOT_FOUND
          });
        }
        this.logger.log(`Sending get_user_id message for user "${userId}"`);
        return this.clientStore.send<boolean>('get_user_id', { id: userId }).pipe(
          tap(userExists => {
            if (!userExists) {
              this.logger.warn(`User with ID "${userId}" not found.`);
              throw new RpcException({
                code: status.NOT_FOUND,
                message: messages.USER.NOT_FOUND2
              });
            }
          }),
          switchMap(()=>{
            this.logger.log(`UserStoreRepo: lopping over the updateStoreDto to update changed fields.`);
            let hasChanges = false;
            for (const key in updateStore) {
              if (updateStore[key] !== undefined && updateStore[key] !== store[key]) {
                store[key] = updateStore[key];
                hasChanges = true;
              }
            }

            if (!hasChanges) {
              this.logger.log(`UserStoreRepo:No changes detected for store with ID "${id}".`);
              throw new RpcException({
                code: status.INVALID_ARGUMENT,
                message: 'No changes detected for store to update.',
              });
            }
            this.logger.log(`UserStoreRepo: Trying to save updates for store with ID "${id}"...`);
            return from(this.userStoreRepository.save(store)).pipe(
              map((savedStore)=>{
                this.logger.log(`UserStoreRepo: store with ID "${id}" updated successfully.`);
                return this.mappedResponse(savedStore)
              }),
              catchError((err)=>{
                this.logger.error(`UserStoreRepo:Failed to update store: ${err.message}`);
                throw new RpcException({
                  code: status.INTERNAL,
                  message: messages.PRODUCTS.FAILED_TO_UPDATE_USER_STORE
                });
              })
            )
          })
        )
      })
    )
  }

  getStore(getId: GetOne): Observable<StoreResponse> {
    const{id} = getId;
    this.logger.log(`UserStoreRepo: Searching for entity by ID "${id}" in repository...'`);
    return from(this.userStoreRepository.findOne({where: {id: id, isActive: true}})).pipe(
      map((store)=>{
        if (!store){
          this.logger.error(`UserStoreRepo: store with ID "${id}" not found'`);
          throw new RpcException({
            code: status.NOT_FOUND,
            message: messages.PRODUCTS.USER_STORE_NOT_FOUND
          })
        }
        this.logger.log(`UserStoreRepo: store with ID "${id}" found successfully `);
        return this.mappedResponse(store)
      })
    )
  }

  getStoreByUserId(request: StoresByUserRequest): Observable<StoreResponse> {
    const{userId} = request;
    this.logger.log(`UserStoreRepo: sending get_user_id message... '`);
    return this.clientStore.send<boolean>('get_user_id', {id: userId}).pipe(
      switchMap((userExists) => {
        if (!userExists) {
          this.logger.log(`UserRepo: entity with ID "${userId}" do not exist.`);
          throw new RpcException({
            code: status.NOT_FOUND,
            message: messages.USER.NOT_FOUND2
          });
        }
        this.logger.log(`UserStoreRepo: Searching for entity by ID "${userId}" in repository...'`);
        return from(this.userStoreRepository.findOne({ where: { userId: userId}})).pipe(
          map((store) => {
            if (!store) {
              this.logger.error(`UserStoreRepo: store with user ID "${userId}" not found'`);
              throw new RpcException({
                code: status.NOT_FOUND,
                message: messages.PRODUCTS.USER_STORE_NOT_FOUND
              })
            }
            this.logger.log(`UserStoreRepo:store with user ID "${userId}" found successfully `);
            return this.mappedResponse(store)
          })
        )
      })
    )
  }

  removeStore(request: GetOne): Observable<BaseProductsResponse> {
    const{id} = request;
    return from(this.userStoreRepository.delete({id})).pipe(
      map((result)=>{
        if (result.affected === 0) {
          throw new RpcException({
            code: status.NOT_FOUND,
            message: messages.PRODUCTS.USER_STORE_NOT_FOUND
          });
        }
        this.logger.log(`UserStoreRepo: store with ID "${id}" deleted successfully `);
        return {
          status: HttpStatus.OK,
          message: messages.PRODUCTS.CUSTOM_PRODUCT_DELETED_SUCCESSFULLY
        }
      }),
      catchError((error)=>{
        this.logger.error(`UserStoreRepo: failed to delete store with ID "${id}". Error: ${error.message}`);
        throw new RpcException({
          code: status.INTERNAL,
          message: messages.PRODUCTS.FAILED_TO_DELETE_USER_STORE
        })
      })
    )
  }


  mappedResponse (store: UserStoreEntity): StoreResponse {
    return {
      id: store.id,
      userId: store.userId,
      storeName: store.storeName,
      storeDescription: store.storeDescription,
      isActive: store.isActive,
      createdAt: dateToTimestamp(store.createdAt),
      updatedAt: dateToTimestamp(store.updatedAt)
    }
  }
}

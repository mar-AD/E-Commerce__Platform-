import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStoreEntity } from './entities/user_store.entity';
import { Repository } from 'typeorm';
import { dateToTimestamp, LoggerService, messages, StoreResponse, StoresByUserRequest } from '@app/common';
import { CreateStoreDto } from '@app/common/dtos';
import { catchError, from, map, Observable, switchMap, tap } from 'rxjs';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class UserStoresService {
  constructor(
    @InjectRepository(UserStoreEntity) private readonly userStoreRepository: Repository<UserStoreEntity>,
    @Inject('RMQ_PRODUCTS_CLIENT') private readonly ClientStore: ClientProxy,
    private readonly logger: LoggerService,
  ) {
  }

  createUserStore(getUser:StoresByUserRequest, createStoreRequestDto: CreateStoreDto): Observable<StoreResponse> {
    const {userId} = getUser;

    return from(this.userStoreRepository.findOne({where: {userId}})).pipe(
      switchMap(store => {
        if (store) {
          this.logger.warn(`Product with ID "${userId}" found.`);
          throw new RpcException({
            code: status.ALREADY_EXISTS,
            message: 'You already have a store'
          });
        }
        this.logger.debug(`Sending get_user_id message for user "${userId}"`);
        return this.ClientStore.send<boolean>('get_user_id', { id: userId }).pipe(
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

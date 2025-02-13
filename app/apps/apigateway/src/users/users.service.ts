import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  FindOneDto,
  GetUserProfileRequest, Non, None, timestampToDate,
  USER_SERVICE_NAME, USER_STORE_SERVICE_NAME, USERS_PROFILE_SERVICE_NAME,
  UserServiceClient, UsersProfileServiceClient, UserStoreClient,
} from '@app/common';
import { AUTH_SERVICE, PRODUCTS_SERVICE, USERS_SERVICE } from '../constants';
import { ClientGrpc } from '@nestjs/microservices';
import { catchError, forkJoin, map, of } from 'rxjs';

@Injectable()
export class UsersService implements OnModuleInit{
  private usersService : UsersProfileServiceClient;
  private authService: UserServiceClient;
  private productsService : UserStoreClient;
  constructor(
    @Inject(USERS_SERVICE) private usersClient: ClientGrpc,
    @Inject(AUTH_SERVICE) private authClient: ClientGrpc,
    @Inject(PRODUCTS_SERVICE) private productsClient: ClientGrpc
  ) {}
  onModuleInit() {
    this.usersService = this.usersClient.getService<UsersProfileServiceClient>(USERS_PROFILE_SERVICE_NAME);
    this.authService = this.authClient.getService<UserServiceClient>(USER_SERVICE_NAME);
    this.productsService = this.productsClient.getService<UserStoreClient>(USER_STORE_SERVICE_NAME)

    // console.log('Users Client Connected:', !!this.usersService);
    // console.log('Auth Client Connected:', !!this.authService);
    // console.log('Product Client data:', this.productsService);
  }

  getProfile(findOneDto: FindOneDto, request: GetUserProfileRequest) {
    return forkJoin({

      authData: this.authService.findOne(findOneDto),
      profileData: this.usersService.getUserProfile(request),
      storeData: this.productsService.getStoresByUser(request).pipe(
        catchError(()=> of(null))
      )

    }).pipe(
      map(({ authData, profileData, storeData }) => {

        const createdAt = authData.createdAt ? timestampToDate(authData.createdAt) : null;
        const updatedAt = authData.updatedAt ? timestampToDate(authData.updatedAt) : null;
        const deletedAt = authData.deletedAt ? timestampToDate(authData.deletedAt) : null;


        const store =
          storeData ? {
              name : storeData.storeName?? null,
              disc : storeData.storeDescription?? null,
              pic : storeData.storePic?? null,
              banner : storeData.storeBanner?? null,
              active : storeData.isActive?? null,
              storeCreatedAt : storeData.createdAt ? timestampToDate(storeData.createdAt) : null,
              storeUpdatedAt : storeData.updatedAt ? timestampToDate(storeData.updatedAt) : null,
            }:
            null

        return {
          ...authData,
          ...profileData,
          createdAt,
          updatedAt,
          deletedAt,
          store
        }
      })
    );
  }

  getAllProfiles(request: None, request1: Non){
    return forkJoin({
      authData: this.authService.getAllUsers(request),
      profileData: this.usersService.getAllUsersProfile(request1),
    }).pipe(
      map(({ authData, profileData }) => {
        const mergedData = authData.entities.map(entity => {
          // Find the matching profile using the userId
          const profile = profileData.profiles.find(p => p.userId === entity.id);
          const createdAt = entity.createdAt ? timestampToDate(entity.createdAt) : null;
          const updatedAt = entity.updatedAt ? timestampToDate(entity.updatedAt) : null;
          const deletedAt = entity.deletedAt? timestampToDate(entity.deletedAt) : null;
          return {
            ...entity,
            profilePic: profile?.profilePic,
            firstName: profile?.firstName,
            lastName: profile?.lastName,
            phoneNumber: profile?.phoneNumber,
            address: profile?.address,
            createdAt,
            updatedAt,
            deletedAt
          };
        });

        return mergedData;
      })
    )
  }
}

import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  FindOneDto,
  GetUserProfileRequest, Non, None,
  USER_SERVICE_NAME,
  USERS_SERVICE_NAME,
  UserServiceClient,
  UsersServiceClient,
} from '@app/common';
import { AUTH_SERVICE, USERS_SERVICE } from '../constants';
import { ClientGrpc } from '@nestjs/microservices';
import { forkJoin, map } from 'rxjs';

@Injectable()
export class UsersService implements OnModuleInit{
  private usersService : UsersServiceClient;
  private authService: UserServiceClient
  constructor(
    @Inject(USERS_SERVICE) private usersClient: ClientGrpc,
    @Inject(AUTH_SERVICE) private authClient: ClientGrpc
  ) {}
  onModuleInit() {
    this.usersService = this.usersClient.getService<UsersServiceClient>(USERS_SERVICE_NAME);
    this.authService = this.authClient.getService<UserServiceClient>(USER_SERVICE_NAME)
  }

   getProfile(findOneDto:FindOneDto, request: GetUserProfileRequest){
    return forkJoin({
      authData: this.authService.findOne(findOneDto),
      profileData: this.usersService.getUserProfile(request)
    }).pipe(
      map(({authData, profileData}) => ({
      ...authData,
      ...profileData
      }))
    )
  }


  getAllProfiles(request: None, request1: Non){
    return forkJoin({
      authData: this.authService.getAllUsers(request),
      profileData: this.usersService.getAllUsersProfile(request1)
    }).pipe(
      map(({authData, profileData}) => ({
        ...authData,
        ...profileData,
      }))
    )
  }
}

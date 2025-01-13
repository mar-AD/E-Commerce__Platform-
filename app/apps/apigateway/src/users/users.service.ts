import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  FindOneDto,
  GetUserProfileRequest, Non, None,
  USER_SERVICE_NAME, USERS_PROFILE_SERVICE_NAME,
  UserServiceClient, UsersProfileServiceClient,
} from '@app/common';
import { AUTH_SERVICE, USERS_SERVICE } from '../constants';
import { ClientGrpc } from '@nestjs/microservices';
import { forkJoin, map, tap } from 'rxjs';

@Injectable()
export class UsersService implements OnModuleInit{
  private usersService : UsersProfileServiceClient;
  private authService: UserServiceClient
  constructor(
    @Inject(USERS_SERVICE) private usersClient: ClientGrpc,
    @Inject(AUTH_SERVICE) private authClient: ClientGrpc
  ) {}
  onModuleInit() {
    this.usersService = this.usersClient.getService<UsersProfileServiceClient>(USERS_PROFILE_SERVICE_NAME);
    this.authService = this.authClient.getService<UserServiceClient>(USER_SERVICE_NAME)

    // console.log('Users Client Connected:', !!this.usersService);
    // console.log('Auth Client Connected:', !!this.authService);

  }

  getProfile(findOneDto: FindOneDto, request: GetUserProfileRequest) {
    return forkJoin({
      authData: this.authService.findOne(findOneDto).pipe(
        tap({
          next: (data) => console.log('Auth Data:', data),
          error: (err) => console.error('Auth Service Error:', err),
        }),
      ),
      profileData: this.usersService.getUserProfile(request).pipe(
        tap({
          next: (data) => console.log('Profile Data:', data),
          error: (err) => console.error('Users Service Error:', err),
        }),
      ),
    }).pipe(
      map(({ authData, profileData }) => ({
        ...authData,
        ...profileData,
      })),
      tap((combinedData) => {
        console.log('Combined Profile Data:', combinedData);
      }),
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

          // Merge the entity and profile data
          return {
            ...entity,
            profilePic: profile?.profilePic,
            firstName: profile?.firstName,
            lastName: profile?.lastName,
            phoneNumber: profile?.phoneNumber,
            address: profile?.address
          };
        });

        return mergedData;
      })
    )
  }
}

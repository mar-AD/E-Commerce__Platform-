import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ADMINS_SERVICE, AUTH_SERVICE } from '../constants';
import { ClientGrpc } from '@nestjs/microservices';
import {
  ADMIN_SERVICE_NAME,
  ADMINS_PROFILE_SERVICE_NAME, AdminServiceClient, AdminsProfileServiceClient,
  FindOneDto, GetAdminProfileRequest, Non, None, UserServiceClient, UsersProfileServiceClient,
} from '@app/common';
import { forkJoin, map, tap } from 'rxjs';

@Injectable()
export class AdminsService implements OnModuleInit{
  private adminsService : AdminsProfileServiceClient;
  private authService: AdminServiceClient
  constructor(
  @Inject(ADMINS_SERVICE) private adminsClient: ClientGrpc,
  @Inject(AUTH_SERVICE) private authClient: ClientGrpc
) {}
onModuleInit() {
  this.adminsService = this.adminsClient.getService<AdminsProfileServiceClient>(ADMINS_PROFILE_SERVICE_NAME);
  this.authService = this.authClient.getService<AdminServiceClient>(ADMIN_SERVICE_NAME)

  // console.log('Admins Client Connected:', !!this.usersService);
  // console.log('Auth Client Connected:', !!this.authService);

}

getProfile(findOneDto: FindOneDto, request: GetAdminProfileRequest) {
  return forkJoin({
    authData: this.authService.findOne(findOneDto).pipe(
      tap({
        next: (data) => console.log('Auth Data:', data),
        error: (err) => console.error('Auth Service Error:', err),
      }),
    ),
    profileData: this.adminsService.getAdminProfile(request).pipe(
      tap({
        next: (data) => console.log('Profile Data:', data),
        error: (err) => console.error('Admins Service Error:', err),
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
    authData: this.authService.getAllAdmins(request),
    profileData: this.adminsService.getAllAdminsProfile(request1),
  }).pipe(
    map(({ authData, profileData }) => {
      const mergedData = authData.entities.map(entity => {
        // Find the matching profile using the adminId
        const profile = profileData.profiles.find(p => p.adminId === entity.id);

        // Merge the entity and profile data
        return {
          ...entity,
          profilePic: profile?.profilePic,
          fullName: profile?.fullName,
        };
      });

      return mergedData;
    })
  )
}
}

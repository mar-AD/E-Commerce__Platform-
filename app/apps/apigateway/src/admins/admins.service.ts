import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ADMINS_SERVICE, AUTH_SERVICE } from '../constants';
import { ClientGrpc } from '@nestjs/microservices';
import {
  ADMIN_SERVICE_NAME,
  ADMINS_PROFILE_SERVICE_NAME, AdminServiceClient, AdminsProfileServiceClient,
  FindOneDto, GetAdminProfileRequest, Non, None, timestampToDate,
} from '@app/common';
import { forkJoin, map } from 'rxjs';

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

}

getProfile(findOneDto: FindOneDto, request: GetAdminProfileRequest) {
  return forkJoin({
    authData: this.authService.findOne(findOneDto),
    profileData: this.adminsService.getAdminProfile(request)
  }).pipe(
    map(({ authData, profileData }) => {
      const createdAt = authData.createdAt ? timestampToDate(authData.createdAt) : null;
      const updatedAt = authData.updatedAt ? timestampToDate(authData.updatedAt) : null;
      const deletedAt = authData.deletedAt? timestampToDate(authData.deletedAt) : null;
      return {
        ...authData,
        ...profileData,
        createdAt,
        updatedAt,
        deletedAt
      }
    })
  );
}

getAllProfiles(request: None, request1: Non){
  return forkJoin({
    authData: this.authService.getAllAdmins(request),
    profileData: this.adminsService.getAllAdminsProfile(request1),
  }).pipe(
    map(({ authData, profileData }) => {
      const mergedData = authData.entities.map(entity => {
        const profile = profileData.profiles.find(p => p.adminId === entity.id);
        const createdAt = entity.createdAt ? timestampToDate(entity.createdAt) : null;
        const updatedAt = entity.updatedAt ? timestampToDate(entity.updatedAt) : null;
        const deletedAt = entity.deletedAt? timestampToDate(entity.deletedAt) : null;
        // Merge the entity and profile data
        return {
          ...entity,
          profilePic: profile?.profilePic,
          fullName: profile?.fullName,
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

import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import {
  ADMIN_SERVICE_NAME,
  AdminServiceClient,
  getPermissionName,
  USER_SERVICE_NAME,
  UserServiceClient,
} from '@app/common';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private adminService: AdminServiceClient;
  private userService: UserServiceClient;
  constructor(
    private reflector: Reflector,
    @Inject('authService') private client: ClientGrpc,
  ) {
    this.adminService = this.client.getService<AdminServiceClient>(ADMIN_SERVICE_NAME)
    this.userService = this.client.getService<UserServiceClient>(USER_SERVICE_NAME)
  }
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic =  this.reflector.getAllAndOverride<boolean>('IS_PUBLIC_KEY', [
      context.getHandler(),
      context.getClass()
    ])
    if (isPublic){
      return true
    }
    const request = context.switchToHttp().getRequest();
    const payload = request.user

    if (!payload){
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'There is no token in the request: Unauthorized',
      });
    }

    const {accessType, permission} = this.reflector.get<{
      accessType: 'admin' | 'user';
      permission: string
    }>('AccessTypeAndPermissions', context.getHandler())

    if (accessType && !accessType.includes(payload.type)) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: `Unauthorized: You do not have access to this resource as a ${payload.type}.`,
      });
    }
    if (payload.type === 'user' && accessType === 'user') {
      return from(this.userService.findUser(payload.id)).pipe(
        map(()=>{
          return true
        })
      )
    }

    if (payload.type === 'admin' && accessType === 'admin'){
       return from(this.adminService.permissionsByRole(payload.id)).pipe(
         switchMap(permissions => {
           if (!permissions){
             throw new RpcException({
               code: status.NOT_FOUND,
               message: 'No permissions found for this admin'
             })
           }
           const requiredPermissions = permissions.permissions.map(par => getPermissionName(par))
           if (!requiredPermissions.includes(permission)){
             throw new RpcException({
               code: status.UNAUTHENTICATED,
               message: 'You do not have sufficient permissions to access this resource.'
             })
           }
           return of(true)
         })
       )
    }

    return throwError(() => new RpcException({
      code: status.UNAUTHENTICATED,
      message: 'You are unauthenticated: The type is not either USER or ADMIN',
    }));

  }
}
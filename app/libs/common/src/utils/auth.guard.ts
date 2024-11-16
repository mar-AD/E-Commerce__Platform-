import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import {
  ADMIN_SERVICE_NAME,
  AdminServiceClient,
  getPermissionName, isPublicKey, LoggerService,
  USER_SERVICE_NAME,
  UserServiceClient,
} from '@app/common';
import { log } from '@grpc/grpc-js/build/src/logging';

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
    console.log('PermissionsGuard: Checking permissions and roles...');
    const isPublic =  this.reflector.get<boolean>(isPublicKey, context.getHandler())
    if (isPublic){
      return true
    }
    const request = context.switchToHttp().getRequest();
    const payload = request.user

    console.log('authguard',payload);
    const {accessType, permission} = this.reflector.get<{
      accessType: ('admin' | 'user')[];
      permission: string
    }>('AccessTypeAndPermissions', context.getHandler())


    if (request.url.includes('user/register') && !payload){
      return true
    }

    // if (request.url.includes('user/register') && payload){
    //   if (payload.type !== 'admin'){
    //     throw new RpcException({
    //       code: status.UNAUTHENTICATED,
    //       message: `Unauthorized: Only admins can create users.`,
    //     });
    //   }
    //   return from(this.adminService.findOneAdmin(payload.id)).pipe(
    //     switchMap( () => {
    //
    //       return from(this.adminService.permissionsByRole(payload.id)).pipe(
    //         switchMap(permissions => {
    //           if (!permissions){
    //             throw new RpcException({
    //               code: status.NOT_FOUND,
    //               message: 'No permissions found for the role that is assigned for this admin'
    //             })
    //           }
    //           const requiredPermissions = permissions.permissions.map(par => getPermissionName(par))
    //           if (!requiredPermissions.includes(permission)){
    //             throw new RpcException({
    //               code: status.UNAUTHENTICATED,
    //               message: 'You do not have sufficient permissions to access this resource.'
    //             })
    //           }
    //           return of(true)
    //         })
    //       )
    //     })
    //   )
    //
    // }



//=============================================================================================
    if (!payload){
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'There is no token in the request: Unauthorized',
      });
    }

    if (accessType && !accessType.includes(payload.type)) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: `Unauthorized: You do not have access to this resource as a ${payload.type}.`,
      });
    }
    if (payload.type === 'user' && accessType.includes('user')) {
      return from(this.userService.findUser(payload.id)).pipe(
        map(()=>{
          return true
        })
      )
    }

    if (payload.type === 'admin' && accessType.includes('admin')){
       return from(this.adminService.findOneAdmin(payload.id)).pipe(
         switchMap( () => {

           if (!permission) {
             return of(true);
           }

           return from(this.adminService.permissionsByRole(payload.id)).pipe(
             switchMap(permissions => {
               if (!permissions){
                 throw new RpcException({
                   code: status.NOT_FOUND,
                   message: 'No permissions found for the role that is assigned for this admin'
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
         })
       )
    }

    return throwError(() => new RpcException({
      code: status.UNAUTHENTICATED,
      message: 'You are unauthenticated: The type is not either USER or ADMIN',
    }));

  }
}

// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   Inject
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { ClientGrpc, RpcException } from '@nestjs/microservices';
// import { Observable, from, of, throwError } from 'rxjs';
// import { map, switchMap } from 'rxjs/operators';
// import { status } from '@grpc/grpc-js';
// import {
//   ADMIN_SERVICE_NAME,
//   AdminServiceClient,
//   getPermissionName,
//   isPublicKey,
//   USER_SERVICE_NAME,
//   UserServiceClient,
// } from '@app/common';
//
// @Injectable()
// export class PermissionsGuard implements CanActivate {
//   private adminService: AdminServiceClient;
//   private userService: UserServiceClient;
//
//   constructor(
//     private reflector: Reflector,
//     @Inject('authService') private client: ClientGrpc,
//   ) {
//     this.adminService = this.client.getService<AdminServiceClient>(ADMIN_SERVICE_NAME);
//     this.userService = this.client.getService<UserServiceClient>(USER_SERVICE_NAME);
//   }
//
//   canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
//     const isPublic = this.reflector.get<boolean>(isPublicKey, context.getHandler());
//     if (isPublic) {
//       return true;
//     }
//
//     const request = context.switchToHttp().getRequest();
//     const payload = request.user;
//
//     if (!payload) {
//       throw new RpcException({
//         code: status.UNAUTHENTICATED,
//         message: 'There is no token in the request: Unauthorized',
//       });
//     }
//
//     const { accessType, permission } = this.reflector.get<{
//       accessType: ('admin' | 'user')[];
//       permission: string;
//     }>('AccessTypeAndPermissions', context.getHandler());
//
//     if (accessType && !accessType.includes(payload.type)) {
//       throw new RpcException({
//         code: status.UNAUTHENTICATED,
//         message: `Unauthorized: You do not have access to this resource as a ${payload.type}.`,
//       });
//     }
//
//     if (payload.type === 'user' && accessType.includes('user')) {
//       return from(this.userService.findUser(payload.id)).pipe(
//         map(() => true),
//       );
//     }
//
//     if (payload.type === 'admin' && accessType.includes('admin')) {
//       return from(this.adminService.findOneAdmin(payload.id)).pipe(
//         switchMap(() => {
//           if (!permission) {
//             return of(true);
//           }
//
//           return from(this.adminService.permissionsByRole(payload.id)).pipe(
//             switchMap(permissions => {
//               if (!permissions) {
//                 throw new RpcException({
//                   code: status.NOT_FOUND,
//                   message: 'No permissions found for the role assigned to this admin',
//                 });
//               }
//
//               const requiredPermissions = permissions.permissions.map(par => getPermissionName(par));
//               if (!requiredPermissions.includes(permission)) {
//                 throw new RpcException({
//                   code: status.UNAUTHENTICATED,
//                   message: 'You do not have sufficient permissions to access this resource.',
//                 });
//               }
//               return of(true);
//             })
//           );
//         })
//       );
//     }
//
//     return throwError(() => new RpcException({
//       code: status.UNAUTHENTICATED,
//       message: 'You are unauthenticated: The type is not either USER or ADMIN',
//     }));
//   }
// }

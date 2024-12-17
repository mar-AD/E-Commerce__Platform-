import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { Observable, from, of, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { status } from '@grpc/grpc-js';
import {
  ADMIN_SERVICE_NAME,
  AdminServiceClient, FindOneDto,
  getPermissionName,
  isPublicKey,
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
    this.adminService = this.client.getService<AdminServiceClient>(ADMIN_SERVICE_NAME);
    this.userService = this.client.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get<boolean>(isPublicKey, context.getHandler());
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const payload = request.user.payload;
    console.log('payload',payload);

    if (!payload) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'There is no token in the request: Unauthorized',
      });
    }

    const { accessType, permission } = this.reflector.get<{
      accessType: ('admin' | 'user')[];
      permission: string;
    }>('AccessTypeAndPermissions', context.getHandler());

    if (accessType && !accessType.includes(payload.type)) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: `Unauthorized: You do not have access to this resource as a ${payload.type}.`,
      });
    }

    if (payload.type === 'user' && accessType.includes('user')) {
      console.log('trying to find a USER');
      const id : FindOneDto = { id: payload.id }
      return from(this.userService.findUser(id)).pipe(
        map(() => true),
      );
    }

    if (payload.type === 'admin' && accessType.includes('admin')) {
      console.log('trying to find a ADMIN');
      const id : FindOneDto = { id: payload.id }
      return from(this.adminService.findOneAdmin(id)).pipe(
        switchMap(() => {
          if (!permission) {
            return of(true);
          }
          console.log('idddd2',payload.id);

          console.log('admin found successfully. now trying to find the permisions');
          return from(this.adminService.permissionsByRole( id )).pipe(
            switchMap(permissions => {
              if (!permissions) {
                console.log('permission not found');
                throw new RpcException({
                  code: status.NOT_FOUND,
                  message: 'No permissions found for the role assigned to this admin',
                });
              }

              const requiredPermissions = permissions.permissions.map(par => getPermissionName(par));
              if (!requiredPermissions.includes(permission)) {
                throw new RpcException({
                  code: status.UNAUTHENTICATED,
                  message: 'You do not have sufficient permissions to access this resource.',
                });
              }
              console.log('permession found successfully', requiredPermissions);
              return of(true);
            })
          );
        })
      );
    }

    return throwError(() => new RpcException({
      code: status.UNAUTHENTICATED,
      message: 'You are unauthenticated: The type is not either USER or ADMIN',
    }));
  }
}

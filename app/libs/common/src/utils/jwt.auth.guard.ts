// import { ExecutionContext, Injectable } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import { Reflector } from '@nestjs/core';
// import { Observable } from 'rxjs';
// import { isPublicKey } from '@app/common/utils/methadata';
//
// @Injectable()
// export class JwtAuthGuard extends AuthGuard('jwt') {
//   constructor(private reflector: Reflector) {
//     super();
//   }
//   canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
//     const isPublic = this.reflector.get<boolean>(isPublicKey, context.getHandler());
//     if (isPublic) {
//       return true;
//     }
//
//     const request = context.switchToHttp().getRequest();
//     const payload = request.user;
//
//     console.log('jwtauthguard',payload);
//     if (request.url.includes('user/register') && !payload){
//       return true
//     }
//
//     if (request.url.includes('user/register') && payload && payload.type !== 'admin') {
//       return false;
//     }
//
//     return super.canActivate(context);
//   }
// }

import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable, lastValueFrom } from 'rxjs';
import { isPublicKey } from '@app/common/utils/methadata';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('JwtAuthGuard: Checking if public or authenticated...');

    const isPublic = this.reflector.get<boolean>(isPublicKey, context.getHandler());
    const request = context.switchToHttp().getRequest();

    // Log whether the endpoint is public
    console.log('isPublic:', isPublic);

    // Allow access to public endpoints immediately
    if (isPublic) {
      console.log('Endpoint is public. Granting access.');
      return true;
    }

    // Attempt to resolve super.canActivate(context)
    try {
      const result = super.canActivate(context);
      const canActivate = await (
        result instanceof Observable ? lastValueFrom(result) : result
      );

      // Log the resolved result
      console.log('canActivate result:', canActivate);

      const payload = request.user; // Should now contain the authenticated user payload
      console.log('JwtAuthGuard payload:', payload);

      if (request.url.includes('user/register')) {
        // Allow public access if no payload (unauthenticated)
        if (!payload) {
          console.log('No payload found for register route. Granting public access.');
          return true;
        }
        // If there is a payload, enforce that the user is an admin
        if (payload && payload.type !== 'admin') {
          console.log('User is not admin. Denying access.');
          return false;
        }
      }

      return canActivate;
    } catch (error) {
      console.error('Error in JwtAuthGuard canActivate:', error);
      return false;
    }
  }
}

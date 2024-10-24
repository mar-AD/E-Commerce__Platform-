// import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
// import * as grpc from '@grpc/grpc-js';
// import { GrpcException } from '@app/common';
//
//
// @Catch(GrpcException)
// export class GrpcExceptionFilter implements ExceptionFilter {
//   catch(exception: GrpcException, host: ArgumentsHost) {
//     const ctx = host.switchToRpc();
//     const callback = ctx.getContext().callback; // Use callback for gRPC response
//
//     // Log the error or handle it as necessary
//     console.error('gRPC Exception caught:', {
//       code: exception.code,
//       message: exception.message,
//       error: exception.getError(),
//     });
//
//
//     // Prepare formatted error response
//     const formattedError = {
//       status: this.getHttpStatus(exception.code),
//       message: exception.message,
//     };
//
//     // Use the callback to send the error back
//     callback({
//       code: exception.code, // gRPC status code
//       details: formattedError, // Custom error details
//     });
//   }
//
//   private getHttpStatus(code: number): number {
//     switch (code) {
//       case grpc.status.OK:
//         return HttpStatus.OK; // 200
//       case grpc.status.CANCELLED:
//         return HttpStatus.REQUEST_TIMEOUT; // 408
//       case grpc.status.UNKNOWN:
//         return HttpStatus.INTERNAL_SERVER_ERROR; // 500
//       case grpc.status.INVALID_ARGUMENT:
//         return HttpStatus.BAD_REQUEST; // 400
//       case grpc.status.DEADLINE_EXCEEDED:
//         return HttpStatus.GATEWAY_TIMEOUT; // 504
//       case grpc.status.NOT_FOUND:
//         return HttpStatus.NOT_FOUND; // 404
//       case grpc.status.ALREADY_EXISTS:
//         return HttpStatus.CONFLICT; // 409
//       case grpc.status.PERMISSION_DENIED:
//         return HttpStatus.FORBIDDEN; // 403
//       case grpc.status.RESOURCE_EXHAUSTED:
//         return HttpStatus.TOO_MANY_REQUESTS; // 429
//       case grpc.status.FAILED_PRECONDITION:
//         return HttpStatus.PRECONDITION_FAILED; // 412
//       case grpc.status.ABORTED:
//         return HttpStatus.CONFLICT; // 409
//       case grpc.status.OUT_OF_RANGE:
//         return HttpStatus.BAD_REQUEST; // 400
//       case grpc.status.UNIMPLEMENTED:
//         return HttpStatus.NOT_IMPLEMENTED; // 501
//       case grpc.status.INTERNAL:
//         return HttpStatus.INTERNAL_SERVER_ERROR; // 500
//       case grpc.status.UNAVAILABLE:
//         return HttpStatus.SERVICE_UNAVAILABLE; // 503
//       case grpc.status.DATA_LOSS:
//         return HttpStatus.INTERNAL_SERVER_ERROR; // 500
//       case grpc.status.UNAUTHENTICATED:
//         return HttpStatus.UNAUTHORIZED; // 401
//       default:
//         return HttpStatus.INTERNAL_SERVER_ERROR; // Fallback to 500
//     }
//   }
// }

import * as grpc from '@grpc/grpc-js';
import {
  HttpException,
  InternalServerErrorException,
  HttpStatus,
  BadRequestException,
  GatewayTimeoutException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { isObject } from 'class-validator';

// Custom function to check if a value is an object
// const isObject = (value: unknown): value is Record<string, unknown> => {
//   return value !== null && typeof value === 'object' && !Array.isArray(value);
// };

// to create the HTTP exception body
const createHttpExceptionBody = (message: object | string, error?: string, status?: number) => {
  if (!message) {
    return { status, error };
  }
  return isObject(message) ? message : { status, error, message };
};

//  to create a custom HTTP exception
const createHttpException = (status: number, defaultError: string = '') => {
  class CustomHttpException extends HttpException {
    public constructor(message?: string | object | any, error = defaultError) {
      super(createHttpExceptionBody(message, error, status), status);
    }
  }
  return CustomHttpException;
};

// Define a type for the mapping
type GrpcToHttpExceptionMap = {
  [key: number]: new (...args: any[]) => HttpException | null;
};

export const GrpcToHttpExceptionMapping: GrpcToHttpExceptionMap = {
  [grpc.status.OK]: null,
  [grpc.status.CANCELLED]: createHttpException(499, 'Client Closed Request'),
  [grpc.status.UNKNOWN]: InternalServerErrorException,
  [grpc.status.INVALID_ARGUMENT]: BadRequestException,
  [grpc.status.DEADLINE_EXCEEDED]: GatewayTimeoutException,
  [grpc.status.NOT_FOUND]: NotFoundException,
  [grpc.status.ALREADY_EXISTS]: ConflictException,
  [grpc.status.PERMISSION_DENIED]: ForbiddenException,
  [grpc.status.UNAUTHENTICATED]: UnauthorizedException,
  [grpc.status.RESOURCE_EXHAUSTED]: createHttpException(HttpStatus.TOO_MANY_REQUESTS, 'Too Many Requests'),
  [grpc.status.FAILED_PRECONDITION]: BadRequestException,
  [grpc.status.ABORTED]: ConflictException,
  [grpc.status.OUT_OF_RANGE]: BadRequestException,
  [grpc.status.UNIMPLEMENTED]: createHttpException(501, 'Not Implemented'),
  [grpc.status.INTERNAL]: InternalServerErrorException,
  [grpc.status.UNAVAILABLE]: ServiceUnavailableException,
  [grpc.status.DATA_LOSS]: InternalServerErrorException,
};


@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Get the appropriate HTTP exception based on the gRPC status
    const grpcStatus = exception.code || grpc.status.UNKNOWN;
    const HttpExceptionClass = GrpcToHttpExceptionMapping[grpcStatus] || InternalServerErrorException;

    const message = exception.details || exception.message.split(': ')[1] || 'An error occurred';
    // Create an instance of the HttpException and retrieve its status
    const httpException = new HttpExceptionClass(message);
    const status = httpException.getStatus ? httpException.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const responsePayload = {
      status,
      message: httpException.message,
      error: HttpExceptionClass.name,
    };
    console.log(`GrpcExceptionFilter response: ${JSON.stringify(responsePayload)}`);

    response.status(status).json(responsePayload);
  }
}

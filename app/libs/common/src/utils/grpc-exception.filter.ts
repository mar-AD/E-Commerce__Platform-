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
    // Extracts the HTTP context from the ArgumentsHost, allowing access to the incoming request and response objects
    const ctx = host.switchToHttp();

    // Retrieves the HTTP response object, which will be used to send back the error details to the client
    const response = ctx.getResponse();
    console.log('Caught Exception:', exception);


    // Detect if exception is a BadRequestException (validation error)
    if (exception instanceof BadRequestException) {
      const responseBody = exception.getResponse();

      const message = Array.isArray(responseBody['message']) ? responseBody['message'].join(', ') : responseBody['message'];

      response.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: message,
        error: 'Bad Request',
      });
    } else if(exception instanceof UnauthorizedException) { //to handle the jwt strategy (PassportStrategy) exceptions

      const responseBody = exception.getResponse();

      const message = Array.isArray(responseBody['message']) ? responseBody['message'] : responseBody['message'];

      response.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        message: message,
        error: 'Unauthorized',
      })

    } else {
      const grpcStatus = exception.code || (exception.error ? exception.error.code : grpc.status.UNKNOWN);
      const HttpExceptionClass = GrpcToHttpExceptionMapping[grpcStatus] || InternalServerErrorException;
      const message = exception.details || exception.message || (exception.error ? exception.error.message : 'An error occurred');
      const httpException = new HttpExceptionClass(message);
      const status = httpException.getStatus ? httpException.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

      response.status(status).json({
        status,
        message: httpException.message,
        error: HttpExceptionClass.name,
      });
    }
  }
}


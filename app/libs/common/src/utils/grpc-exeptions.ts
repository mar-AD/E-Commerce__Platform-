import * as grpc from '@grpc/grpc-js';

export class GrpcException extends Error {
  public readonly message: string;

  public constructor(public readonly code: number, private readonly error: string | object = 'Unknown error') {
    super();
    if (error == null) {
      this.message = 'Unknown error';
    } else {
      this.message = typeof error === 'string' ? error : JSON.stringify(error);
    }
  }


  public getError() {
    return this.error;
  }
}

export class GrpcCanceledException extends GrpcException {
  public constructor(error: string | object) {
    super(grpc.status.CANCELLED, error);
  }
}

export class GrpcUnknownException extends GrpcException {
  public constructor(error: string | object) {
    super(grpc.status.UNKNOWN, error);
  }
}

export class GrpcInvalidArgumentException extends GrpcException {
  public constructor(error: string | object) {
    super(grpc.status.INVALID_ARGUMENT, error);
  }
}

export class GrpcDeadlineExceededException extends GrpcException {
  public constructor(error: string | object) {
    super(grpc.status.DEADLINE_EXCEEDED, error);
  }
}

export class GrpcNotFoundException extends GrpcException {
  public constructor(error: string | object) {
    super(grpc.status.NOT_FOUND, error);
  }
}

export class GrpcAlreadyExistsException extends GrpcException {
  public constructor(error: string | object) {
    super(grpc.status.ALREADY_EXISTS, error);
  }
}

export class GrpcPermissionDeniedException extends GrpcException {
  public constructor(error: string | object) {
    super(grpc.status.PERMISSION_DENIED, error);
  }
}

export class GrpcUnauthenticatedException extends GrpcException {
  public constructor(error: string | object) {
    super(grpc.status.UNAUTHENTICATED, error);
  }
}

export class GrpcResourceExhaustedException extends GrpcException {
  public constructor(error: string | object) {
    super(grpc.status.RESOURCE_EXHAUSTED, error);
  }
}

export class GrpcFailedPreconditionException extends GrpcException {
  public constructor(error: string | object) {
    super(grpc.status.FAILED_PRECONDITION, error);
  }
}

export class GrpcAbortedException extends GrpcException {
  public constructor(error: string | object) {
    super(grpc.status.ABORTED, error);
  }
}

export class GrpcOutOfRangeException extends GrpcException {
  public constructor(error: string | object) {
    super(grpc.status.OUT_OF_RANGE, error);
  }
}

export class GrpcUnimplementedException extends GrpcException {
  public constructor(error: string | object) {
    super(grpc.status.UNIMPLEMENTED, error);
  }
}

export class GrpcInternalException extends GrpcException {
  public constructor(error: string | object) {
    super(grpc.status.INTERNAL, error); // Updated to correct status code
  }
}

export class GrpcUnavailableException extends GrpcException {
  public constructor(error: string | object) {
    super(grpc.status.UNAVAILABLE, error);
  }
}

export class GrpcDataLossException extends GrpcException {
  public constructor(error: string | object) {
    super(grpc.status.DATA_LOSS, error);
  }
}

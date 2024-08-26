export class ResponseDto<T> {
  results: T;
  status: number;
  message: string;

  constructor(
    results: T,
    status: number,
    message: string,
  ) {
    this.results = results;
    this.status = status;
    this.message = message;
  }
}
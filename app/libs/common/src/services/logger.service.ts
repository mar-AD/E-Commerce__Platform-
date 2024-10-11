import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService extends Logger{
  constructor() {
    super();
  }

  public log(message: string): void {
    super.log(message, 'LOG INFOS');
  }

  public debug(message: string): void {
    super.debug(message, 'DEBUG');
  }

  public warn(message: string): void{
    super.warn(message, 'WARN');
  }

  public error(message: string): void{
    super.error(message,'ERROR')
    this.Trace()
  }

  public Trace(){
    console.trace()
  }
}
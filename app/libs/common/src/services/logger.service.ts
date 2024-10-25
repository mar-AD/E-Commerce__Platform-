import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService extends Logger{
  constructor() {
    super();
  }

  public log(message: any): void {
    super.log(message, 'LOG INFOS');
  }

  public debug(message: any): void {
    super.debug(message, 'DEBUG');
  }

  public warn(message: any): void{
    super.warn(message, 'WARN');
  }

  public error(message: any): void{
    super.error(message,'ERROR')
    // this.Trace()
  }

  // public Trace(){
  //   console.trace()
  // }
}
import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminsService {
  getHello(): string {
    return 'Hello World!';
  }
}

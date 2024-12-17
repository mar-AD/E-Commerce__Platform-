import { Controller, Get } from '@nestjs/common';
import { AdminsService } from './admins.service';

@Controller()
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  getHello(): string {
    return this.adminsService.getHello();
  }
}

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Controller()
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @MessagePattern('createAdmin')
  create(@Payload() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  @MessagePattern('findAllAdmins')
  findAll() {
    return this.adminsService.findAll();
  }

  @MessagePattern('findOneAdmin')
  findOne(@Payload() id: number) {
    return this.adminsService.findOne(id);
  }

  @MessagePattern('updateAdmin')
  update(@Payload() updateAdminDto: UpdateAdminDto) {
    return this.adminsService.update(updateAdminDto.id, updateAdminDto);
  }

  @MessagePattern('removeAdmin')
  remove(@Payload() id: number) {
    return this.adminsService.remove(id);
  }
}

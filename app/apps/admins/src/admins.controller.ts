import { Controller } from '@nestjs/common';
import { AdminsService } from './admins.service';
import {
  AdminsProfileServiceController,
  AdminsProfileServiceControllerMethods, BaseResponse,
  GetAdminProfileRequest,
  LoggerService,
} from '@app/common';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { UpdateAdminProfileDto } from '@app/common/dtos';

@Controller()
@AdminsProfileServiceControllerMethods()
export class AdminsController implements AdminsProfileServiceController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly logger: LoggerService,
  ) {}

  @EventPattern('create_admin_profile')
  async createAdminProfile(@Payload() data: { adminId: string }, @Ctx() context: RmqContext) {
    this.logger.log(`Controller received 'create_admin_profile' event for ${data.adminId}`)
    await this.adminsService.registerAdminProfile(data, context)
  }

  getAdminProfile(request: GetAdminProfileRequest) {
    return this.adminsService.getAdminsProfile(request)
  }

  getAllAdminsProfile(){
    return this.adminsService.getAllAdminsProfiles()
  }

  @MessagePattern('update_admin_profile')
  async updateAdminProfile(
    @Payload() data: { id: string; request: UpdateAdminProfileDto },
    @Ctx() context: RmqContext,
  ): Promise<BaseResponse> {
    this.logger.log(`Controller received 'update_admin_profile' event for ${data.id}`);

    const response = await this.adminsService.updateAdminProfile(data, context);

    this.logger.log(`Response sent: ${JSON.stringify(response)}`);
    return { ... response };
  }


  //this for when the admin deletes the admin
  @EventPattern('delete_admin_profile')
  async deleteProfile(@Payload() data: {id: string}, @Ctx() context: RmqContext) {
    this.logger.log(`Controller received 'delete_admin_profile' event for ${data.id}`)
    await this.adminsService.removeAdminProfile(data, context)
  }
}

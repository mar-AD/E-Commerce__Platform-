import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import {
  BaseResponse,
  GetUserProfileRequest, GetUserProfileResponse,
  LoggerService, UserProfile, UsersProfileServiceController, UsersProfileServiceControllerMethods,
} from '@app/common';
import { UpdateUserProfileDto } from '@app/common/dtos/users-dtos';

@Controller()
@UsersProfileServiceControllerMethods()
export class UsersController implements UsersProfileServiceController{
  constructor(
    private readonly usersService: UsersService,
    private logger: LoggerService,
  ) {}

  @EventPattern('create_user_profile')
  async createUserProfile(@Payload() data: { userId: string }, @Ctx() context: RmqContext) {
    this.logger.log(`Controller received 'create_user_profile' event for ${data.userId}`)
    await this.usersService.registerUserProfile(data, context)
  }

  getUserProfile(request: GetUserProfileRequest) {
    return this.usersService.getUsersProfile(request)
  }

  getAllUsersProfile(){
    return this.usersService.getAllUsersProfiles()
  }

  @MessagePattern('update_user_profile')
  async updateUserProfile(
    @Payload() data: { id: string; request: UpdateUserProfileDto },
    @Ctx() context: RmqContext,
  ): Promise<BaseResponse> {
    this.logger.log(`Controller received 'update_user_profile' event for ${data.id}`);

    const response = await this.usersService.updateUserProfile(data, context);

    this.logger.log(`Response sent: ${JSON.stringify(response)}`);
    return { ... response };
  }


  //this for when the admin deletes the user
  @EventPattern('delete_user_profile')
  async deleteProfile(@Payload() data: {id: string}, @Ctx() context: RmqContext) {
    this.logger.log(`Controller received 'delete_user_profile' event for ${data.id}`)
    await this.usersService.removeUserProfile(data, context)
  }


  @MessagePattern('get_user_profile')
  async getProfile(@Payload() data: { id: string }, @Ctx() context: RmqContext): Promise<GetUserProfileResponse | boolean> {
    this.logger.log(`Controller received 'get_user_profile' event for ${data.id}`)
    return await this.usersService.getProfile(data, context)
  }
}

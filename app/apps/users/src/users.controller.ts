import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import {
  GetUserProfileRequest,
  LoggerService,
  UsersServiceController,
} from '@app/common';
import { UpdateUserProfileDto } from '@app/common/dtos/users-dtos';

@Controller()
export class UsersController implements UsersServiceController{
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

  @EventPattern('update_user_profile')
  async updateUserProfile(@Payload() data: {id: string}, request: UpdateUserProfileDto, @Ctx() context: RmqContext) {
    this.logger.log(`Controller received 'update_user_profile' event for ${data.id}`)
    await this.usersService.updateUserProfile(data, request, context)
  }

  //this for when the admin deletes the user
  @EventPattern('delete_user_profile')
  async deleteProfile(@Payload() data: {id: string}, @Ctx() context: RmqContext) {
    this.logger.log(`Controller received 'delete_user_profile' event for ${data.id}`)
    await this.usersService.removeUserProfile(data, context)
  }
}

import { Controller, Get } from '@nestjs/common';
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
    this.logger.log(`Controller received 'welcome_email' event for ${data.userId}`)
    await this.usersService.registerUserProfile(data, context)
  }

  getUserProfile(request: GetUserProfileRequest) {
    return this.usersService.getUsersProfile(request)
  }

  getAllUsersProfiles(){
    return this.usersService.getAllUsersProfiles()
  }

  updateUserProfile(request: UpdateUserProfileDto) {
    return this.usersService.updateUsersProfile(request)
  }

  deleteProfile(request: GetUserProfileRequest) {
    return this.usersService.removeUserProfile(request)
  }
}

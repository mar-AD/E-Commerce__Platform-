import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { EmailService } from './email.service';
import { LoggerService } from '@app/common';

@Controller()
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private logger: LoggerService
  ) {}

  @EventPattern('welcome_email')
  async handleWelcomeEmail(@Payload() data: { email: string }, @Ctx() context: RmqContext){
    this.logger.log(`Controller received 'welcome_email' event for ${data.email}`);
    await this.emailService.sendWelcomeEmail(data, context);
  }

  @EventPattern('reset_pass_email')
  async handleResetPassEmail(@Payload() data: {email: string, token: string}, @Ctx() context: RmqContext){
    this.logger.log(`Controller received 'reset_pass_email' event for ${data.email}`)
    await this.emailService.sendResetPasswordEmail(data, context);
  }

  @EventPattern('req_update_email_email')
  async handleResetEmailEmail(@Payload() data: {email: string, verificationCode: string}, @Ctx() context: RmqContext) {
    this.logger.log(`Controller received 'req_reset_email_email' event for ${data.email}`)
    await this.emailService.sendEmailUpdateReqEmail(data, context);
  }

}

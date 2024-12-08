import { Controller, Logger } from '@nestjs/common';
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
  async handleWelcomeEmail(@Payload() data: { email: string }, @Ctx() context: RmqContext): Promise<void> {
    this.logger.log(`Controller received 'welcome_email' event for ${data.email}`);
    await this.emailService.sendWelcomeEmail(data, context);
  }
}

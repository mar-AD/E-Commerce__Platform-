import { Inject, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { RmqContext, RpcException } from '@nestjs/microservices';
import { LoggerService } from '@app/common';
import { emailStructure } from './emails/welcome-email';
import { welcomeEmailHtml } from './templates/welcome';

@Injectable()
export class EmailService {
  constructor(
    @Inject('MAIL_TRANSPORTER') private readonly transporter: nodemailer.Transporter,
    private logger: LoggerService
  ) {}

  async sendWelcomeEmail(data :{ email: string } , context: RmqContext): Promise<void> {

    const {email}=data
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    const html = welcomeEmailHtml
    const subject = 'Welcome to our Platform!'
    const welcomeMail = emailStructure(email, subject, html)

    try {
      this.logger.log(`Sending welcome email to ${email}`);
      await this.transporter.sendMail(welcomeMail);
      this.logger.log(`Welcome email sent successfully to ${email}`);
      channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}: ${error}`);
      channel.nack(originalMessage, false, true);
      throw new RpcException('Email delivery failed');
    }
  }
}

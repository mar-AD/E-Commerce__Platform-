import { Inject, Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer'
import * as process from 'node:process';
import { Ctx, EventPattern, Payload, RmqContext, RpcException } from '@nestjs/microservices';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject('MAIL_TRANSPORTER') private readonly transporter: nodemailer.Transporter
  ) {}

  @EventPattern('welcome.email')
  async sendWelcomeEmail(@Payload() payload: {email: string}, @Ctx() context: RmqContext): Promise<void> {
    const {email} = payload;
    this.logger.log(`Received welcome.email event for ${email}`);
    
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to our Platform!',
      template: 'welcome',
      context: {
        appName: 'E-Commerce Platform',
        email: email,
      }
    }

    try {
      this.logger.log(`Attempting to send welcome email to ${email}`);
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent successfully to ${email}`);
      channel.ack(originalMessage);
    }
    catch(error) {
      this.logger.error(`Failed to send welcome email to ${email}: ${error}`);
      channel.nack(originalMessage);
      throw new RpcException('Email delivery failed');
    }
  }
}

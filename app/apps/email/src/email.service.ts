import { Inject, Injectable } from '@nestjs/common';
// import { LoggerService } from '@app/common';
import * as nodemailer from 'nodemailer'
import * as process from 'node:process';
import { Ctx, EventPattern, Payload, RmqContext, RpcException } from '@nestjs/microservices';

@Injectable()
export class EmailService {
  constructor(
    // private readonly logger: LoggerService,
    @Inject('MAIL_TRANSPORTER') private readonly transporter: nodemailer.Transporter
  ) {}

  @EventPattern('welcome.email')
  async sendWelcomeEmail(@Payload() payload: {email: string}, @Ctx() context: RmqContext): Promise<void> {
    const {email} = payload
    const channel = context.getChannelRef(); // Get the channel for message acknowledgment
    const originalMessage = context.getMessage(); // Get the original message

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to ...',
      template: 'welcome',
      context: {
        appName: 'i dont know yet',
        email: email,
      }
    }
    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${email}`)
      channel.ack(originalMessage);
    }
    catch(error){
      console.error(`Failed to send welcome email to ${email}`);
      channel.nack(originalMessage);
      throw new RpcException('Email delivery failed')
    }
  }

}

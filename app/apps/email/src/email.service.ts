import { Inject, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { RmqContext, RpcException } from '@nestjs/microservices';
import { LoggerService } from '@app/common';
import { EMAIL_SUBJECTS, emailStructure } from './constants';
import { welcomeEmailHtml } from './templates/welcome-email';
import { resetPassHtml } from './templates/reset-password-email';
import { emailUpdateRequestHtml } from './templates/req-email-update-email';

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
    const subject =  EMAIL_SUBJECTS.WELCOME
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

  async sendResetPasswordEmail(data:{email: string, token: string} , context: RmqContext): Promise<void> {
    const {email, token}= data;
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    const html = resetPassHtml(token)
    const subject =  EMAIL_SUBJECTS.RESET_PASSWORD
    const resetPassMail = emailStructure( email, subject, html)

    console.log('Email Content:', html);

    try {
      this.logger.log(`Sending resetPass email to ${email}`);
      await this.transporter.sendMail(resetPassMail)
      this.logger.log(`Reset Password email sent successfully to ${email}`);
      channel.ack(originalMessage);
    }catch(error) {
      this.logger.error(`Failed to send Reset Password email to ${email}: ${error}`);
      channel.nack(originalMessage, false, true);
      throw new RpcException('Email delivery failed');
    }
  }

  async sendEmailUpdateReqEmail(data:{email: string, verificationCode: string} , context: RmqContext): Promise<void>{
    const {email, verificationCode}= data;
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    const html = emailUpdateRequestHtml(verificationCode)
    const subject =  EMAIL_SUBJECTS.EMAIL_UPDATED
    const resetPassMail = emailStructure( email, subject, html)

    try {
      this.logger.log(`Sending email update email to ${email}`);
      await this.transporter.sendMail(resetPassMail)
      this.logger.log(`Email update email sent successfully to ${email}`);
      channel.ack(originalMessage);
    }catch(error) {
      this.logger.error(`Failed to send Email update email to ${email}: ${error}`);
      channel.nack(originalMessage, false, true);
      throw new RpcException('Email delivery failed');
    }

  }
}

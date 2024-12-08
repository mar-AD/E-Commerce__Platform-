import { Inject, Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { RmqContext, RpcException } from '@nestjs/microservices';
import { LoggerService } from '@app/common';

@Injectable()
export class EmailService {
  constructor(
    @Inject('MAIL_TRANSPORTER') private readonly transporter: nodemailer.Transporter,
    private logger: LoggerService
  ) {}

  async sendWelcomeEmail(data: { email: string }, context: RmqContext): Promise<void> {
    const { email } = data;

    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to our Platform!',
      html: `
      <html lang="">
        <body>
          <h1>Welcome to the E-Commerce Platform!</h1>
          <p>We're excited to have you with us. Your registration is complete, and you can now start exploring the features and products available.</p>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <br />
          <p>Best regards,</p>
          <p>The E-Commerce Platform Team</p>
        </body>
      </html>
    `,
    };

    try {
      this.logger.log(`Sending welcome email to ${email}`);
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent successfully to ${email}`);
      channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}: ${error}`);
      channel.nack(originalMessage, false, true);
      throw new RpcException('Email delivery failed');
    }
  }
}

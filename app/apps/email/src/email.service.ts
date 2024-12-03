import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '@app/common';
import * as nodemailer from 'nodemailer'
import * as process from 'node:process';
import * as hbs from 'nodemailer-express-handlebars'
import { join } from 'path'
import { EventPattern, Payload, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class EmailService {
  constructor(
    private readonly logger: LoggerService,
    @Inject('MAIL_TRANSPORTER') private transporter: nodemailer.Transporter,
  ) {

    this.transporter.use(
      'compile',
      hbs({
        viewEngine: {
          extname: '.hbs',
          layoutsDir: join(__dirname, '../templates'),
          defaultLayout: false,
        },
        viewPath: join(__dirname, '../templates'),
        extname: '.hbs',
      })
    );
  }

  @EventPattern('welcome.email')
  async sendWelcomeEmail(@Payload() payload:{email: string} ): Promise<void> {
    const {email} = payload

    const mailOptions = {
      from: process.env.EMAIL_FROM,
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
      this.logger.log(`Welcome email sent to ${email}`)
    }
    catch(error){
      this.logger.error(`Failed to send welcome email to ${email}`);
      throw new RpcException({
        status: status.INTERNAL,
        message: 'Email delivery failed',
      })
    }
  }

}

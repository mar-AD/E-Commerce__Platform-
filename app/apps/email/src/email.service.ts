import { HttpStatus, Injectable } from '@nestjs/common';
import { LoggerService } from '@app/common';
import * as nodemailer from 'nodemailer'
import * as process from 'node:process';
import * as hbs from 'nodemailer-express-handlebars'
import { join } from 'path'
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class EmailService {
  constructor(
    private readonly logger: LoggerService,
    private transporter: nodemailer.Transporter
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    })

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


  async sendWelcomeEmail(email: string): Promise<void> {
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

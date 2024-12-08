import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';
import process from 'node:process';
import * as nodemailer from 'nodemailer';
import { CommonModule } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        './apps/email/.env',
        './.env'
      ]
    }),
    CommonModule
  ],
  controllers: [EmailController],
  providers: [
    EmailService,
    {
      provide: 'MAIL_TRANSPORTER',
      useFactory: () => {
        return nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          secure: false,
          auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          }
        })
        // transporter.use(
        //   'compile',
        //   hbs.default({
        //     viewEngine: {
        //       extname: '.hbs',
        //       layoutsDir: join(__dirname, '../templates'),
        //       defaultLayout: false,
        //     },
        //     viewPath: join(__dirname, '../templates'),
        //     extname: '.hbs',
        //   })
        // );
        // return transporter
      }
    }
  ],
})
export class EmailModule {}

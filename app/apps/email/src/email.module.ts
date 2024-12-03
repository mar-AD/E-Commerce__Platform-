import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { CommonModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as process from 'node:process';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        './apps/email/.env',
        './.env'
      ]
    }),
    CommonModule],
  controllers: [EmailController],
  providers: [
    {
      provide: 'MAIL_TRANSPORTER',
      useFactory: ()=>{
        return nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          secure: false,
          auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          }
        })
      }
    },
    EmailService],
})
export class EmailModule {}

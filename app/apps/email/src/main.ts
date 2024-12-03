import { NestFactory } from '@nestjs/core';
import { EmailModule } from './email.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(EmailModule)
  const configService = appContext.get(ConfigService)

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    EmailModule,
    {
      transport: Transport.RMQ,
      options:{
        urls: [configService.get<string>('RABBITMQ_URL')],
        queue: configService.get<string>('RABBITMQ_EMAIL_QUEUE'),
        queueOptions: {
          durable: true
        },
        noAck: false,// Ensures messages are acknowledged only after successful processing
        persistent: true
      }
    }
  );

  await app.listen();
}
bootstrap();

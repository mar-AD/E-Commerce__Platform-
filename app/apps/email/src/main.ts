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
        urls: [configService.get<string>('notyet')],
        queue: configService.get<string>('notyet'),
        queueOptions: {
          durable: true
        },
        noAck: false,
        persistent: true
      }
    }
  );
  await app.listen();
}
bootstrap();

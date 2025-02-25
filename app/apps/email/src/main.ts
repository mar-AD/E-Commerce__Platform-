import { NestFactory } from '@nestjs/core';
import { EmailModule } from './email.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  console.log('Starting Email Microservice bootstrap process...');

  const app = await NestFactory.create(EmailModule);
  console.log('Application context created.');

  const configService = app.get(ConfigService);
  console.log('ConfigService loaded.');

  const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');
  const emailQueue = configService.get<string>('RABBITMQ_EMAIL_QUEUE');

  console.log(`[Configuration] RabbitMQ URL: ${rabbitmqUrl}`);
  console.log(`[Configuration] Email Queue Name: ${emailQueue}`);

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: emailQueue,
        queueOptions: {
          durable: true,
        },
        noAck: false, // Ensures messages are acknowledged only after successful processing
        persistent: true,
      },
    },
  );

  console.log('Microservice created. Attempting to start...');
  try {
    await app.startAllMicroservices()
    console.log('Email Microservice started successfully: Listening for events...');
  } catch (error) {
    console.error('Failed to start Email Microservice:', error);
  }
}

bootstrap();
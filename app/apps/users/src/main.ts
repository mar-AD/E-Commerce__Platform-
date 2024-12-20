import { NestFactory } from '@nestjs/core';
import { UsersModule } from './users.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { USERS_PACKAGE_NAME } from '@app/common';

async function bootstrap() {
  // const app = await NestFactory.create(UsersModule);
  try {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
      UsersModule,
      {
        transport: Transport.GRPC,
        options: {
          protoPath: join(__dirname, '../proto/users.proto'),
          package: USERS_PACKAGE_NAME,
          url: '0.0.0.0:50053',
        }
      }
    )
    await app.listen();
    console.log('Users microservice is running on port 50053 (Grpc client)');
  }catch (err){
    console.log('Error starting the users microservice:', err)
  }
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AdminsModule } from './admins.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path'
// import { ADMINS_PACKAGE_NAME } from '@app/common';

async function bootstrap() {
  // const app = await NestFactory.create(AdminsModule);
  try {
    const app = NestFactory.createMicroservice<MicroserviceOptions>(
      AdminsModule,
      {
        transport: Transport.GRPC,
        options: {
          protoPath: join(__dirname, '../proto/admins.proto'),
          package: ADMINS_PACKAGE_NAME,
          url: '0.0.0.0:50055',
        }
      }
    )
    await app.listen();
    console.log('admins microservice is running on port 50055');
  }catch (err){
    console.log('Error starting the admins microservice:', err);
  }
}
bootstrap();

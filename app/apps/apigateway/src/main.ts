import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GrpcExceptionFilter } from '@app/common';
// import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('API Gateway for the microservices architecture')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api-docs', app, document);
  app.useGlobalFilters(new GrpcExceptionFilter());
  await app.listen(3000).then(()=>{
    console.log('http://localhost:3000/api-docs');
  });
}
bootstrap();

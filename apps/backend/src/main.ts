import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Permitir conexiones desde el frontend
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Todas las rutas comenzarán con /api/v1
  app.setGlobalPrefix('api/v1');

  // Validación de los datos recibidos
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Puerto del backend
  const port = process.env.PORT || 4000;

  await app.listen(port);

  console.log(
    `🚀 API VeciPets escuchando en http://localhost:${port}/api/v1`,
  );
}

bootstrap();
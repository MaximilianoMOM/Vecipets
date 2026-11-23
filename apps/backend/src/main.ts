
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global de la API
  app.setGlobalPrefix('api/v1');

  // Permite leer las cookies enviadas por el navegador
  app.use(cookieParser());

  // Valida los datos recibidos en los DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Permite que el frontend envíe cookies al backend
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    credentials: true,
  });

  // Puerto del backend
  const port = process.env.PORT ?? 4000;

  await app.listen(port);

  console.log(
    `VeciPets backend ejecutándose en el puerto ${port}`,
  );

  console.log(
    `API disponible en http://localhost:${port}/api/v1`,
  );
}

void bootstrap();

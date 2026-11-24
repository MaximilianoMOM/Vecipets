
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Servir archivos estáticos subidos (fotografías de mascotas)
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

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

  const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, '');
  const origenesPermitidos = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    ...(frontendUrl ? [frontendUrl] : []),
  ];

  // Permite que el frontend envíe cookies al backend
  app.enableCors({
    origin: origenesPermitidos,
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

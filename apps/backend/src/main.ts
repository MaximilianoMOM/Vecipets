import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Prefijo global de la API
  app.setGlobalPrefix('api/v1');

  // Permite leer las cookies enviadas por el navegador
  app.use(cookieParser());

  // Valida y limpia los datos recibidos en los DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Limpia cualquier barra '/' final accidental en la variable de entorno
  const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '');

  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://vecipets-frontend.vercel.app',
    frontendUrl,
  ].filter((origin): origin is string => Boolean(origin));

  // Configuración CORS con tipos explícitos para evitar el error ts(7006)
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Permite peticiones sin origen (Postman, apps móviles, health checks de Render)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      logger.warn(`Origen bloqueado por CORS: ${origin}`);
      return callback(new Error('No permitido por CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  // Render asigna el puerto dinámicamente y requiere escuchar en 0.0.0.0
  const port = Number(process.env.PORT) || 4000;
  await app.listen(port, '0.0.0.0');

  logger.log(`VeciPets backend ejecutándose en el puerto ${port}`);
  logger.log(`Orígenes CORS habilitados: ${allowedOrigins.join(', ')}`);
}

void bootstrap();
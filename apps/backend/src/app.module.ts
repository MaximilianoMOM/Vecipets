
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { PagosModule } from './pagos/pagos.module';
import { ReportesModule } from './reportes/reportes.module';
import { ValidacionImagenesModule } from './validacion-imagenes/validacion-imagenes.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { JornadasModule } from './jornadas/jornadas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';

        if (!databaseUrl) {
          throw new Error('No se ha configurado DATABASE_URL');
        }

        return {
          type: 'postgres' as const,
          url: databaseUrl,
          autoLoadEntities: true,
          synchronize: false,
          ssl: isProduction
            ? { rejectUnauthorized: false }
            : false,
        };
      },
    }),

    UsuariosModule,
    AuthModule,
    PagosModule,
    JornadasModule,
    ReportesModule,
    ValidacionImagenesModule,
    NotificacionesModule,
    JornadasModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

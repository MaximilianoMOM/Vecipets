
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { GoogleStrategy } from './google.strategy';
import { GoogleAuthGuard } from './google-auth.guard';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    PassportModule.register({ session: false }),
    UsuariosModule,
  ],
  controllers: [AuthController],
  providers: [
    GoogleStrategy,
    GoogleAuthGuard,
  ],
})
export class AuthModule {}

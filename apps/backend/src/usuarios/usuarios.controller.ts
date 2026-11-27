
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  ParseBoolPipe,
  NotFoundException,
  Res,
  UseGuards,
  ForbiddenException,
  ServiceUnavailableException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import type { Response, Request } from 'express';

import { UsuariosService } from './usuarios.service';
import { RegistroUsuarioDto } from './dto/crear-usuario.dto';
import { VerificarCorreoDto } from './dto/verificar-correo.dto';
import { LoginConRecaptchaDto } from './dto/login.dto';
import { ModerarAliadoDto } from './dto/moderar-aliado.dto';
import { SolicitarRecuperacionDto } from './dto/solicitar-recuperacion.dto';
import { RestablecerContrasenaDto } from './dto/restablecer-contrasena.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UsuarioAutenticado } from './decorators/usuario-autenticado.decorator';

interface SolicitudAutenticada extends Request {
  usuario?: {
    sub: number;
    correo?: string;
    rol?: string;
  };
}

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // CONSULTAR TODOS: solo ADMINISTRADOR
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  obtenerTodos() {
    return this.usuariosService.obtenerTodos();
  }

  @Patch(':id/suspension')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  cambiarSuspension(
    @Param('id', ParseIntPipe) id: number,
    @Body('suspendido', ParseBoolPipe) suspendido: boolean,
  ) {
    return this.usuariosService.cambiarSuspension(id, suspendido);
  }

  @Patch(':id/aprobacion')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  moderarAliado(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: ModerarAliadoDto,
  ) {
    return this.usuariosService.moderarAliado(id, datos.estado);
  }

  // CONSULTAR USUARIO DE LA SESIÓN ACTUAL
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async obtenerUsuarioActual(
    @UsuarioAutenticado()
    usuarioAutenticado: { sub: number },
  ) {
    const usuario = await this.usuariosService.obtenerPorId(
      usuarioAutenticado.sub,
    );

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return usuario;
  }


  // CONSULTAR PERFIL: propietario o ADMINISTRADOR
  
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioAutenticado()
    usuarioAutenticado: { sub: number; rol?: string },
  ) {
    const esAdministrador =
      usuarioAutenticado.rol === 'ADMINISTRADOR';

    const esPropietario =
      usuarioAutenticado.sub === id;

    if (!esAdministrador && !esPropietario) {
      throw new ForbiddenException(
        'No tienes permiso para consultar este perfil.',
      );
    }

    const usuario = await this.usuariosService.obtenerPorId(id);

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return usuario;
  }


  // REGISTRO PÚBLICO
  @Post()
  async crear(@Body() { recaptchaToken, ...datos }: RegistroUsuarioDto) {
    await this.verificarRecaptcha(recaptchaToken, 'register');
    return this.usuariosService.crear(datos);
  }

  private async verificarRecaptcha(recaptchaToken: string, accion: 'register' | 'login') {
    const secret = (accion === 'login' ? process.env.RECAPTCHA_V2_SECRET_KEY : process.env.RECAPTCHA_SECRET_KEY)?.trim();
    if (!secret) {
      throw new ServiceUnavailableException('La verificación reCAPTCHA no está disponible.');
    }

    let verificacion: { success?: boolean; action?: string; score?: number; 'error-codes'?: string[] };
    try {
      const respuesta = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        body: new URLSearchParams({ secret, response: recaptchaToken }),
        signal: AbortSignal.timeout(5000),
      });
      if (!respuesta.ok) {
        throw new Error(`reCAPTCHA respondió con HTTP ${respuesta.status}`);
      }
      verificacion = await respuesta.json();
    } catch {
      throw new ServiceUnavailableException('La verificación reCAPTCHA no está disponible.');
    }

    if (accion === 'login' && verificacion?.['error-codes']?.includes('timeout-or-duplicate')) {
      throw new ForbiddenException('La verificación reCAPTCHA venció o ya se usó. Marca la casilla nuevamente.');
    }
    if (accion === 'login' && verificacion?.['error-codes']?.some(codigo =>
      codigo === 'invalid-input-secret' || codigo === 'missing-input-secret'
    )) {
      throw new ServiceUnavailableException('La verificación reCAPTCHA no está disponible.');
    }
    if (
      verificacion?.success !== true ||
      (accion === 'register' && (
        verificacion.action !== accion ||
        typeof verificacion.score !== 'number' ||
        verificacion.score < 0.5
      ))
    ) {
      throw new ForbiddenException('No se pudo verificar reCAPTCHA. Intenta nuevamente.');
    }

  }

  // VERIFICACIÓN DEL CORREO
  @Post('verificar-correo')
  verificarCorreo(@Body() datos: VerificarCorreoDto) {
    return this.usuariosService.verificarCorreo(
      datos.correo,
      datos.codigo,
    );
  }

  // INICIO DE SESIÓN
  @Post('login')
  async login(
    @Body() { recaptchaToken, ...datos }: LoginConRecaptchaDto,
    @Res({ passthrough: true }) respuesta: Response,
  ) {
    await this.verificarRecaptcha(recaptchaToken, 'login');
    return this.usuariosService.login(datos, respuesta);
  }
    // CERRAR SESIÓN
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  cerrarSesion(@Res({ passthrough: true }) respuesta: Response) {
    respuesta.clearCookie('vecipets_access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return {
      mensaje: 'Sesión cerrada correctamente.',
    };
  }

  // SOLICITAR RECUPERACIÓN
  @Post('solicitar-recuperacion')
  solicitarRecuperacion(
    @Body() datos: SolicitarRecuperacionDto,
  ) {
    return this.usuariosService.solicitarRecuperacion(datos.correo);
  }

  // RESTABLECER CONTRASEÑA
  @Post('restablecer-contrasena')
  restablecerContrasena(
    @Body() datos: RestablecerContrasenaDto,
  ) {
    return this.usuariosService.restablecerContrasena(datos);
  }

  // ELIMINAR: solo ADMINISTRADOR
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.eliminar(id);
  }
}

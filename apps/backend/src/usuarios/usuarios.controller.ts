
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  NotFoundException,
  Res,
  UseGuards,
  ForbiddenException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import type { Response, Request } from 'express';

import { UsuariosService } from './usuarios.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { VerificarCorreoDto } from './dto/verificar-correo.dto';
import { LoginDto } from './dto/login.dto';
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
  crear(@Body() datos: CrearUsuarioDto) {
    return this.usuariosService.crear(datos);
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
  login(
    @Body() datos: LoginDto,
    @Res({ passthrough: true }) respuesta: Response,
  ) {
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


import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  randomInt,
  createHash,
  timingSafeEqual,
} from 'crypto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';

import { Usuario } from './usuario.entity';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { RestablecerContrasenaDto } from './dto/restablecer-contrasena.dto';
import { CorreoService } from './correo.service';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    private readonly correoService: CorreoService,
    private readonly jwtService: JwtService,
  ) {}

  
async obtenerTodos() {
  const usuarios = await this.usuariosRepository.find();

  return usuarios.map((usuario) => ({
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
    estadoAprobacion: usuario.estadoAprobacion,
    correoVerificado: usuario.correoVerificado,
  }));
}


 async obtenerPorId(id: number) {
  const usuario = await this.usuariosRepository.findOneBy({ id });

  if (!usuario) {
    return null;
  }

  return {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
    estadoAprobacion: usuario.estadoAprobacion,
    correoVerificado: usuario.correoVerificado,
  };
}
  // REGISTRO
  async crear(datos: CrearUsuarioDto): Promise<{ mensaje: string }> {
    const correo = datos.correo.trim().toLowerCase();

    const existente = await this.usuariosRepository.findOneBy({ correo });

    if (existente) {
      throw new ConflictException('Este correo ya está registrado.');
    }

    const codigo = randomInt(100000, 1000000).toString();
    const codigoHash = createHash('sha256')
      .update(codigo)
      .digest('hex');

    const passwordHash = await bcrypt.hash(datos.password, 12);
    const esCiudadano = datos.rol === 'CIUDADANO';

    const usuario = this.usuariosRepository.create({
      nombre: datos.nombre.trim(),
      correo,
      passwordHash,
      rol: datos.rol,
      estadoAprobacion: esCiudadano ? 'APROBADO' : 'PENDIENTE',
      correoVerificado: false,
      codigoVerificacionHash: codigoHash,
      codigoVerificacionExpira: new Date(Date.now() + 5 * 60 * 1000),
      intentosVerificacion: 0,
    });

    await this.usuariosRepository.save(usuario);

    try {
      await this.correoService.enviarCodigo(correo, codigo);
    } catch {
      throw new InternalServerErrorException(
        'No se pudo enviar el código. Intenta nuevamente más tarde.',
      );
    }

    return {
      mensaje: 'Registro creado. Revisa tu correo para verificar tu cuenta.',
    };
  }

  // VERIFICACIÓN DEL CORREO
  async verificarCorreo(
    correo: string,
    codigo: string,
  ): Promise<{ mensaje: string }> {
    const correoNormalizado = correo.trim().toLowerCase();

    const usuario = await this.usuariosRepository.findOneBy({
      correo: correoNormalizado,
    });

    if (!usuario) {
      throw new UnauthorizedException(
        'El correo o el código no son válidos.',
      );
    }

    if (usuario.correoVerificado) {
      return { mensaje: 'El correo ya está verificado.' };
    }

    if (
      !usuario.codigoVerificacionExpira ||
      usuario.codigoVerificacionExpira.getTime() <= Date.now() ||
      !usuario.codigoVerificacionHash
    ) {
      throw new UnauthorizedException(
        'El código venció. Solicita uno nuevo.',
      );
    }

    if (usuario.intentosVerificacion >= 3) {
      throw new UnauthorizedException(
        'Superaste los intentos permitidos. Solicita un nuevo código.',
      );
    }

    const codigoHash = createHash('sha256')
      .update(codigo)
      .digest('hex');

    const coincide = timingSafeEqual(
      Buffer.from(codigoHash, 'hex'),
      Buffer.from(usuario.codigoVerificacionHash, 'hex'),
    );

    if (!coincide) {
      usuario.intentosVerificacion += 1;
      await this.usuariosRepository.save(usuario);

      throw new UnauthorizedException(
        'El correo o el código no son válidos.',
      );
    }

    usuario.correoVerificado = true;
    usuario.codigoVerificacionHash = null;
    usuario.codigoVerificacionExpira = null;
    usuario.intentosVerificacion = 0;

    await this.usuariosRepository.save(usuario);

    return { mensaje: 'Correo verificado correctamente.' };
  }

  // INICIO DE SESIÓN
  async login(datos: LoginDto, respuesta: any) {
    const correo = datos.correo.trim().toLowerCase();

    const usuario = await this.usuariosRepository.findOneBy({ correo });

    if (
      !usuario ||
      !usuario.passwordHash ||
      !(await bcrypt.compare(datos.password, usuario.passwordHash))
    ) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }

    if (!usuario.correoVerificado) {
      throw new ForbiddenException('Debes verificar tu correo primero.');
    }

    if (usuario.estadoAprobacion !== 'APROBADO') {
      throw new ForbiddenException(
        'Tu cuenta está pendiente de aprobación por el administrador.',
      );
    }

    const payload = {
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    respuesta.cookie('vecipets_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    return {
      mensaje: 'Inicio de sesión exitoso.',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    };
  }

  // SOLICITAR RECUPERACIÓN DE CONTRASEÑA
  async solicitarRecuperacion(
    correoIngresado: string,
  ): Promise<{ mensaje: string }> {
    const correo = correoIngresado.trim().toLowerCase();
    const usuario = await this.usuariosRepository.findOneBy({ correo });

    const mensaje =
      'Si el correo está registrado y verificado, recibirás instrucciones para recuperar tu contraseña.';

    if (!usuario || !usuario.correoVerificado) {
      return { mensaje };
    }

    const ahora = Date.now();

    // Reiniciar el contador cuando termine el bloqueo.
    if (
      usuario.bloqueoRecuperacionHasta &&
      usuario.bloqueoRecuperacionHasta.getTime() <= ahora
    ) {
      usuario.bloqueoRecuperacionHasta = null;
      usuario.solicitudesRecuperacion = 0;
      usuario.intentosRecuperacion = 0;
      usuario.codigoRecuperacionHash = null;
      usuario.codigoRecuperacionExpira = null;
    }

    // Bloquear nuevas solicitudes durante 30 minutos.
    if (
      usuario.bloqueoRecuperacionHasta &&
      usuario.bloqueoRecuperacionHasta.getTime() > ahora
    ) {
      throw new HttpException(
        'Demasiadas solicitudes. Intenta nuevamente después de 30 minutos.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    usuario.solicitudesRecuperacion += 1;

    // Después de la tercera solicitud, bloquear las siguientes.
    if (usuario.solicitudesRecuperacion >= 3) {
      usuario.bloqueoRecuperacionHasta = new Date(
        ahora + 30 * 60 * 1000,
      );
    }

    const codigo = randomInt(100000, 1000000).toString();

    usuario.codigoRecuperacionHash = createHash('sha256')
      .update(codigo)
      .digest('hex');

    usuario.codigoRecuperacionExpira = new Date(
      ahora + 5 * 60 * 1000,
    );

    usuario.intentosRecuperacion = 0;

    await this.usuariosRepository.save(usuario);

    try {
      await this.correoService.enviarCodigoRecuperacion(correo, codigo);
    } catch {
      throw new InternalServerErrorException(
        'No se pudo enviar el correo de recuperación.',
      );
    }

    return { mensaje };
  }

  // VALIDAR CÓDIGO Y CAMBIAR CONTRASEÑA
  async restablecerContrasena(
    datos: RestablecerContrasenaDto,
  ): Promise<{ mensaje: string }> {
    const correo = datos.correo.trim().toLowerCase();

    const usuario = await this.usuariosRepository.findOneBy({ correo });

    if (!usuario || !usuario.correoVerificado) {
      throw new UnauthorizedException(
        'El correo o el código no son válidos.',
      );
    }

    if (
      !usuario.codigoRecuperacionHash ||
      !usuario.codigoRecuperacionExpira ||
      usuario.codigoRecuperacionExpira.getTime() <= Date.now()
    ) {
      throw new UnauthorizedException(
        'El código venció o no existe. Solicita uno nuevo.',
      );
    }

    if (usuario.intentosRecuperacion >= 3) {
      throw new UnauthorizedException(
        'Superaste los 3 intentos. Solicita un nuevo código cuando esté permitido.',
      );
    }

    const codigoHash = createHash('sha256')
      .update(datos.codigo)
      .digest('hex');

    const coincide = timingSafeEqual(
      Buffer.from(codigoHash, 'hex'),
      Buffer.from(usuario.codigoRecuperacionHash, 'hex'),
    );

    if (!coincide) {
      usuario.intentosRecuperacion += 1;
      await this.usuariosRepository.save(usuario);

      throw new UnauthorizedException(
        'El correo o el código no son válidos.',
      );
    }

    usuario.passwordHash = await bcrypt.hash(
      datos.nuevaContrasena,
      12,
    );

    usuario.codigoRecuperacionHash = null;
    usuario.codigoRecuperacionExpira = null;
    usuario.intentosRecuperacion = 0;
    usuario.solicitudesRecuperacion = 0;
    usuario.bloqueoRecuperacionHasta = null;

    await this.usuariosRepository.save(usuario);

    return {
      mensaje: 'Tu contraseña fue restablecida correctamente.',
    };
  }

  // ELIMINAR USUARIO
  async eliminar(id: number): Promise<void> {
    await this.usuariosRepository.delete(id);
  }
  
  // INICIO DE SESIÓN CON GOOGLE
  async iniciarSesionGoogle(
    datos: {
      googleId: string;
      nombre: string;
      correo: string;
    },
    respuesta: Response,
  ) {
    const correo = datos.correo.trim().toLowerCase();

    let usuario = await this.usuariosRepository.findOneBy({
      googleId: datos.googleId,
    });

    if (!usuario) {
      usuario = await this.usuariosRepository.findOneBy({
        correo,
      });
    }

    // Si no existe, crear una cuenta ciudadana verificada por Google.
    if (!usuario) {
      usuario = this.usuariosRepository.create({
        nombre: datos.nombre.trim().slice(0, 100),
        correo,
        googleId: datos.googleId,
        passwordHash: null,
        rol: 'CIUDADANO',
        estadoAprobacion: 'APROBADO',
        correoVerificado: true,
        codigoVerificacionHash: null,
        codigoVerificacionExpira: null,
        intentosVerificacion: 0,
      });

      usuario = await this.usuariosRepository.save(usuario);
    } else {
      // Evitar vincular una cuenta de Google diferente.
      if (
        usuario.googleId &&
        usuario.googleId !== datos.googleId
      ) {
        throw new ConflictException(
          'Este correo ya está vinculado a otra cuenta de Google.',
        );
      }

      // No permitir que Google active una cuenta local
      // cuyo correo todavía no ha sido verificado.
      if (!usuario.googleId && !usuario.correoVerificado) {
        throw new ForbiddenException(
          'Primero debes verificar el correo de tu cuenta existente.',
        );
      }

      if (!usuario.googleId) {
        usuario.googleId = datos.googleId;
        usuario = await this.usuariosRepository.save(usuario);
      }
    }

    // Respetar la aprobación de refugios y veterinarias.
    if (usuario.estadoAprobacion !== 'APROBADO') {
      throw new ForbiddenException(
        'Tu cuenta está pendiente de aprobación por el administrador.',
      );
    }

    const accessToken = await this.jwtService.signAsync(
      {
        sub: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol,
      },
      { expiresIn: '15m' },
    );

    respuesta.cookie('vecipets_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    return {
      mensaje: 'Inicio de sesión con Google exitoso.',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    };
  }
}

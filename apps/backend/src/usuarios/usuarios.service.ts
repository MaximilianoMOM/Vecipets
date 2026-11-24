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

  private establecerCookieSesion(respuesta: Response, accessToken: string): void {
    const esProduccion = process.env.NODE_ENV === 'production';

    respuesta.cookie('vecipets_access_token', accessToken, {
      httpOnly: true,
      secure: esProduccion,
      sameSite: esProduccion ? 'none' : 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });
  }

  // OBTENER TODOS LOS USUARIOS
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

  // OBTENER USUARIO POR ID
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

  // INICIO DE SESIÓN TRADICIONAL
  async login(datos: LoginDto, respuesta: Response) {
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

    // JWT válido durante 24 horas.
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1d',
    });

    this.establecerCookieSesion(respuesta, accessToken);

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

    const mensaje =
      'Si el correo está registrado y verificado, recibirás instrucciones para recuperar tu contraseña.';

    // Obtener la fecha actual según la zona horaria de Colombia.
    const partesFecha = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());

    const obtenerParte = (tipo: string) =>
      partesFecha.find((parte) => parte.type === tipo)?.value ?? '';

    const fechaHoy =
      `${obtenerParte('year')}-${obtenerParte('month')}-${obtenerParte('day')}`;

    // Transacción para evitar superar el límite con solicitudes simultáneas.
    const resultado = await this.usuariosRepository.manager.transaction(
      async (manager) => {
        const repositorio = manager.getRepository(Usuario);

        const usuario = await repositorio.findOne({
          where: { correo },
          lock: { mode: 'pessimistic_write' },
        });

        if (!usuario || !usuario.correoVerificado) {
          return null;
        }

        // Reiniciar el contador solamente cuando cambia el día.
        if (usuario.fechaSolicitudesRecuperacion !== fechaHoy) {
          usuario.solicitudesRecuperacion = 0;
          usuario.fechaSolicitudesRecuperacion = fechaHoy;
        }

        // Permitir máximo tres solicitudes por día.
        if (usuario.solicitudesRecuperacion >= 3) {
          throw new HttpException(
            'Alcanzaste el máximo de 3 solicitudes de recuperación por día. Intenta nuevamente mañana.',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }

        const codigo = randomInt(100000, 1000000).toString();

        usuario.solicitudesRecuperacion += 1;

        usuario.codigoRecuperacionHash = createHash('sha256')
          .update(codigo)
          .digest('hex');

        usuario.codigoRecuperacionExpira = new Date(
          Date.now() + 5 * 60 * 1000,
        );

        usuario.intentosRecuperacion = 0;

        // El bloqueo anterior de 30 minutos deja de controlar el límite.
        usuario.bloqueoRecuperacionHasta = null;

        await repositorio.save(usuario);

        return { codigo };
      },
    );

    if (!resultado) {
      return { mensaje };
    }

    try {
      await this.correoService.enviarCodigoRecuperacion(
        correo,
        resultado.codigo,
      );
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

    // Limpiar el código utilizado.
    // No reiniciar las solicitudes diarias.
    usuario.codigoRecuperacionHash = null;
    usuario.codigoRecuperacionExpira = null;
    usuario.intentosRecuperacion = 0;

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

    // JWT de Google válido durante 24 horas.
    const accessToken = await this.jwtService.signAsync(
      {
        sub: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol,
      },
      { expiresIn: '1d' },
    );

    this.establecerCookieSesion(respuesta, accessToken);

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
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  NotificacionAdminTurbo,
  RegistrarNotificacionTurboDto,
} from './interfaces/notificacion-admin.interface';

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);
  private readonly rutaArchivo: string;
  private readonly rutaFallback: string;
  private notificaciones: Map<string, NotificacionAdminTurbo> = new Map();

  constructor() {
    const directorioBase = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(directorioBase)) {
      try {
        fs.mkdirSync(directorioBase, { recursive: true });
      } catch {
        // En sandbox o entornos con permisos restringidos, se usará el fallback
      }
    }
    this.rutaArchivo = path.join(directorioBase, 'notificaciones_admin.json');
    this.rutaFallback = path.join(os.tmpdir(), 'vecipets_notificaciones_admin.json');
    this.cargarDesdeDisco();
  }

  private cargarDesdeDisco(): void {
    try {
      let contenido: string | null = null;
      if (fs.existsSync(this.rutaArchivo)) {
        contenido = fs.readFileSync(this.rutaArchivo, 'utf-8');
      } else if (fs.existsSync(this.rutaFallback)) {
        contenido = fs.readFileSync(this.rutaFallback, 'utf-8');
      }

      if (contenido) {
        const items: NotificacionAdminTurbo[] = JSON.parse(contenido);
        this.notificaciones.clear();
        for (const item of items) {
          this.notificaciones.set(item.clave ?? item.referencia, item);
        }
        this.logger.log(`Cargadas ${this.notificaciones.size} notificaciones desde almacenamiento persistente.`);
      }
    } catch (error) {
      this.logger.warn(`Iniciando notificaciones en memoria: ${error}`);
    }
  }

  private guardarEnDisco(): void {
    try {
      const items = Array.from(this.notificaciones.values());
      const data = JSON.stringify(items, null, 2);
      try {
        fs.writeFileSync(this.rutaArchivo, data, 'utf-8');
      } catch {
        // Fallback al directorio temporal del sistema operativo
        fs.writeFileSync(this.rutaFallback, data, 'utf-8');
      }
    } catch (error) {
      this.logger.warn(`Notificaciones persistidas en memoria activa.`);
    }
  }

  /**
   * Registra una notificación para el administrador cuando un pago Turbo se aprueba.
   * Evita duplicados si Wompi reenvía el webhook con la misma referencia.
   */
  async registrarNotificacionPagoTurbo(
    dto: RegistrarNotificacionTurboDto,
  ): Promise<NotificacionAdminTurbo> {
    const referencia = dto.referencia.trim();
    const clave = dto.clave ?? referencia;

    // Idempotencia: si ya existe para esta referencia, no duplicar
    if (this.notificaciones.has(clave)) {
      this.logger.log(
        `Notificación para la referencia ${referencia} ya existía previamente. Omitiendo duplicado.`,
      );
      return this.notificaciones.get(clave)!;
    }

    const nuevaNotificacion: NotificacionAdminTurbo = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      titulo: dto.titulo || 'Nuevo pago de Alerta Turbo',
      usuarioNombre: dto.usuarioNombre.trim(),
      reporteId: dto.reporteId,
      reservaId: dto.reservaId,
      clave: dto.clave,
      monto: dto.monto || '$15.000 COP',
      referencia,
      fechaPago: dto.fechaPago instanceof Date ? dto.fechaPago.toISOString() : dto.fechaPago,
      estado: dto.estado || 'Aprobado',
      enlaceReporte: dto.enlaceReporte || `/reportes/${dto.reporteId}`,
      leida: false,
      creadoEn: new Date().toISOString(),
    };

    this.notificaciones.set(clave, nuevaNotificacion);
    this.guardarEnDisco();

    this.logger.log(
      `Notificación creada para admin: Reporte #${dto.reporteId}, Ref: ${referencia}, Usuario: ${dto.usuarioNombre}`,
    );

    return nuevaNotificacion;
  }

  /**
   * Consulta todas las notificaciones administrativas ordenadas de más reciente a más antigua.
   */
  async obtenerNotificacionesAdmin(): Promise<NotificacionAdminTurbo[]> {
    const items = Array.from(this.notificaciones.values());
    return items.sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime());
  }

  /**
   * Marca una notificación como leída por el administrador.
   */
  async marcarComoLeida(id: string): Promise<NotificacionAdminTurbo> {
    for (const [ref, notif] of this.notificaciones.entries()) {
      if (notif.id === id || notif.referencia === id) {
        notif.leida = true;
        this.notificaciones.set(ref, notif);
        this.guardarEnDisco();
        return notif;
      }
    }
    throw new NotFoundException(`No se encontró la notificación con id ${id}`);
  }
}

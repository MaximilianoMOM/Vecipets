
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Usuario } from '../usuarios/usuario.entity';

export enum TipoReporte {
  PERDIDA = 'PERDIDA',
  HALLAZGO = 'HALLAZGO',
}

export enum EstadoAprobacionReporte {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}

export enum EstadoReporte {
  PENDIENTE = 'PENDIENTE',
  PUBLICO = 'PUBLICO',
  RECHAZADO = 'RECHAZADO',
  RESUELTO = 'RESUELTO',
  CERRADO = 'CERRADO',
}

@Entity('reportes')
export class Reporte {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'varchar', length: 20 })
  tipo: TipoReporte;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 30 })
  especie: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  raza: string | null;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'date', name: 'fecha_evento' })
  fechaEvento: string;

  @Column({ type: 'varchar', length: 150, name: 'barrio_sector' })
  barrioSector: string;

  @Column({ type: 'text', name: 'imagen_url' })
  imagenUrl: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: EstadoAprobacionReporte.PENDIENTE,
    name: 'estado_aprobacion',
  })
  estadoAprobacion: EstadoAprobacionReporte;

  @Column({
    type: 'varchar',
    length: 20,
    default: EstadoReporte.PENDIENTE,
  })
  estado: EstadoReporte;

  @Column({ type: 'boolean', default: false, name: 'es_turbo' })
  esTurbo: boolean;

  @Column({
    type: 'timestamptz',
    nullable: true,
    name: 'turbo_activada_en',
  })
  turboActivadaEn: Date | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
    name: 'turbo_vence_en',
  })
  turboVenceEn: Date | null;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn: Date;
}

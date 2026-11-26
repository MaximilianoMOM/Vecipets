import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Jornada } from './jornada.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Pago } from '../pagos/pago.entity';

export const MENSAJE_RESERVA_EN_REVISION =
  'Recibimos tu pago, pero no pudimos confirmar tu cupo. El caso está pendiente de revisión administrativa.';

export enum EstadoReservaJornada {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADA = 'CONFIRMADA',
  RECHAZADA = 'RECHAZADA',
  EXPIRADA = 'EXPIRADA',
  CANCELADA = 'CANCELADA',
}

@Entity('reservas_jornadas')
export class ReservaJornada {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, name: 'codigo' })
  codigo: string;

  @ManyToOne(() => Jornada)
  @JoinColumn({ name: 'jornada_id' })
  jornada: Jornada;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  // Pago vigente o primer pago aprobado de esta reserva.
  @ManyToOne(() => Pago, { nullable: true })
  @JoinColumn({ name: 'pago_id' })
  pago: Pago | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'referencia_pago',
  })
  referenciaPago: string | null; // Referencia original, conservada para reconciliar reintentos.

  @Column({
    type: 'varchar',
    length: 200,
    name: 'nombre_propietario',
  })
  nombrePropietario: string;

  @Column({
    type: 'varchar',
    length: 200,
    name: 'nombre_mascota',
  })
  nombreMascota: string;

  @Column({
    type: 'integer',
    name: 'precio_procedimiento_historico_centavos',
    default: 0,
  })
  precioProcedimientoHistoricoCentavos: number;

  @Column({
    type: 'integer',
    name: 'precio_apartado_historico_centavos',
    default: 0,
  })
  precioApartadoHistoricoCentavos: number;

  @Column({
    type: 'varchar',
    length: 30,
    default: EstadoReservaJornada.PENDIENTE,
    name: 'estado',
  })
  estado: EstadoReservaJornada;

  @Column({ type: 'timestamptz', name: 'expira_en' })
  expiraEn: Date;

  @Column({
    type: 'timestamptz',
    nullable: true,
    name: 'confirmada_en',
  })
  confirmadaEn: Date | null;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn: Date;
}

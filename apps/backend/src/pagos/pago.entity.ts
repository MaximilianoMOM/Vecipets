
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Reporte } from '../reportes/reporte.entity';

export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  EXPIRADO = 'EXPIRADO',
}

export enum ConceptoPago {
  LEGADO = 'LEGADO',
  ALERTA_TURBO = 'ALERTA_TURBO',
  APARTADO_RESERVA = 'APARTADO_RESERVA',
}

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', name: 'usuario_id' })
  usuarioId: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  referencia: string;

  @Column({ type: 'integer', name: 'monto_centavos' })
  montoCentavos: number;

  @Column({ type: 'varchar', length: 3, default: 'COP' })
  moneda: string;

  @Column({
    type: 'varchar',
    length: 30,
    default: ConceptoPago.LEGADO,
  })
  concepto: ConceptoPago;

  @Column({
    type: 'varchar',
    length: 20,
    default: EstadoPago.PENDIENTE,
  })
  estado: EstadoPago;

  @ManyToOne(() => Reporte, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'reporte_id' })
  reporte: Reporte | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'wompi_transaction_id',
  })
  wompiTransactionId: string | null;

  @Column({ type: 'text', nullable: true, name: 'checkout_url' })
  checkoutUrl: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn: Date;
}

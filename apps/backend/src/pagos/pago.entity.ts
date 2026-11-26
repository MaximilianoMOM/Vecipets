
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Usuario } from '../usuarios/usuario.entity';
import { Reporte } from '../reportes/reporte.entity';
import { IntentoPago } from './intento-pago.entity';

export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  EXPIRADO = 'EXPIRADO',
  ERROR = 'ERROR',
  ANULADO = 'ANULADO',
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

  // Usuario propietario del pago
  @ManyToOne(() => Usuario, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  referencia: string; // Inmutable. Cada nuevo checkout firmado tiene su propio pago.

  @Column({
    type: 'integer',
    name: 'monto_centavos',
  })
  montoCentavos: number;

  @Column({
    type: 'varchar',
    length: 3,
    default: 'COP',
  })
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

  // Reporte asociado cuando el pago corresponde a Alerta Turbo
  @ManyToOne(() => Reporte, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'reporte_id' })
  reporte: Reporte | null;

  // Identificador de la transacción principal o más reciente de Wompi
  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'wompi_transaction_id',
  })
  wompiTransactionId: string | null;

  @Column({
    type: 'text',
    nullable: true,
    name: 'checkout_url',
  })
  checkoutUrl: string | null;

  // Un pago puede tener varios intentos de transacción
  @OneToMany(() => IntentoPago, (intento) => intento.pago)
  intentos: IntentoPago[];

  @CreateDateColumn({
    name: 'creado_en',
    type: 'timestamptz',
  })
  creadoEn: Date;

  @UpdateDateColumn({
    name: 'actualizado_en',
    type: 'timestamptz',
  })
  actualizadoEn: Date;
}

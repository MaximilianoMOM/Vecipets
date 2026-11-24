
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Pago } from './pago.entity';

export enum EstadoIntentoPago {
  PENDIENTE = 'PENDING',
  APROBADO = 'APPROVED',
  RECHAZADO = 'DECLINED',
  ERROR = 'ERROR',
  ANULADO = 'VOIDED',
}

@Entity('intentos_pago')
export class IntentoPago {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Pago, (pago) => pago.intentos, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'pago_id' })
  pago: Pago;

  @Column({
    name: 'wompi_transaction_id',
    type: 'varchar',
    length: 100,
    unique: true,
  })
  wompiTransactionId: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  estado: EstadoIntentoPago;

  @Column({
    name: 'monto_centavos',
    type: 'integer',
  })
  montoCentavos: number;

  @Column({
    type: 'varchar',
    length: 3,
  })
  moneda: string;

  @Column({
    name: 'metodo_pago',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  metodoPago: string | null;

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


import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ unique: true, length: 255 })
  correo: string;

  // Identificador de la cuenta de Google
  @Column({
    name: 'google_id',
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: true,
  })
  googleId: string | null;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  passwordHash: string | null;

  @Column({ type: 'varchar', length: 20, default: 'CIUDADANO' })
  rol: string;

  @Column({
    name: 'estado_aprobacion',
    type: 'varchar',
    length: 20,
    default: 'APROBADO',
  })
  estadoAprobacion: string;

  @Column({ name: 'correo_verificado', type: 'boolean', default: false })
  correoVerificado: boolean;

  @Column({
    name: 'codigo_verificacion_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  codigoVerificacionHash: string | null;

  @Column({
    name: 'codigo_verificacion_expira',
    type: 'timestamptz',
    nullable: true,
  })
  codigoVerificacionExpira: Date | null;

  @Column({ name: 'intentos_verificacion', type: 'integer', default: 0 })
  intentosVerificacion: number;

  // Recuperación de contraseña
  @Column({
    name: 'codigo_recuperacion_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  codigoRecuperacionHash: string | null;

  @Column({
    name: 'codigo_recuperacion_expira',
    type: 'timestamptz',
    nullable: true,
  })
  codigoRecuperacionExpira: Date | null;

  @Column({
    name: 'intentos_recuperacion',
    type: 'integer',
    default: 0,
  })
  intentosRecuperacion: number;

  @Column({
    name: 'solicitudes_recuperacion',
    type: 'integer',
    default: 0,
  })
  solicitudesRecuperacion: number;

  @Column({
    name: 'bloqueo_recuperacion_hasta',
    type: 'timestamptz',
    nullable: true,
  })
  bloqueoRecuperacionHasta: Date | null;
}
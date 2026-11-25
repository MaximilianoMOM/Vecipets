import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('jornadas')
export class Jornada {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'organizador_id' })
  organizadorId: number;

  @Column({ type: 'varchar', length: 200 })
  titulo: string;

  @Column({ type: 'varchar', length: 200 })
  veterinaria: string;

  @Column({ type: 'varchar', length: 100 })
  comuna: string;

  @Column({ type: 'varchar', length: 200 })
  direccion: string;

  @Column({ type: 'varchar', length: 100, name: 'fecha_texto' })
  fechaTexto: string;

  @Column({ type: 'varchar', length: 100, name: 'hora_texto' })
  horaTexto: string;

  @Column({ type: 'timestamptz', name: 'fecha_inicio' })
  fechaInicio: Date;

  @Column({ type: 'timestamptz', name: 'fecha_fin' })
  fechaFin: Date;

  @Column({
    type: 'integer',
    name: 'precio_procedimiento_centavos',
    default: 0,
  })
  precioProcedimientoCentavos: number;

  @Column({
    type: 'integer',
    name: 'precio_apartado_centavos',
    default: 0,
  })
  precioApartadoCentavos: number;

  @Column({ type: 'integer', name: 'cupos_totales', default: 10 })
  cuposTotales: number;

  @Column({ type: 'integer', name: 'cupos_disponibles', default: 10 })
  cuposDisponibles: number;

  @Column({ type: 'text', nullable: true, name: 'imagen_url' })
  imagenUrl: string | null;

  @Column({ type: 'boolean', default: false, name: 'destacado' })
  destacado: boolean;

  @Column({ type: 'boolean', default: true, name: 'activa' })
  activa: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn: Date;
}

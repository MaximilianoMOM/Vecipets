import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Reporte } from './reporte.entity';

@Entity('avistamientos')
export class Avistamiento {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Reporte, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporte_id' })
  reporte: Reporte;

  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'varchar', length: 200 })
  direccion: string;

  @Column({ name: 'barrio_sector', type: 'varchar', length: 150 })
  barrioSector: string;

  @Column({ type: 'double precision' })
  latitud: number;

  @Column({ type: 'double precision' })
  longitud: number;

  @Column({ type: 'varchar', length: 1000 })
  comentario: string;

  @Column({ name: 'fecha_avistamiento', type: 'timestamptz' })
  fechaAvistamiento: Date;

  @Column({ name: 'imagen_tipo', type: 'varchar', nullable: true })
  imagenTipo: string | null;

  @Column({ type: 'bytea', nullable: true, select: false })
  imagen: Buffer | null;

  @Column({ default: true })
  visible: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn: Date;
}

import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

export type TipoSede = 'VETERINARIA' | 'CLINICA' | 'REFUGIO';

@Entity('sedes')
export class Sede {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'organizador_id', type: 'int' })
  organizadorId: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizador_id' })
  organizador: Usuario;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 20 })
  tipo: TipoSede;

  @Column({ type: 'varchar', length: 180 })
  direccion: string;

  @Column({ type: 'varchar', length: 140 })
  horario: string;

  @Column({ type: 'text', array: true })
  servicios: string[];

  @Column({ type: 'varchar', length: 25 })
  telefono: string;

  @Column({ name: 'imagen_url', type: 'text', nullable: true })
  imagenUrl: string | null;
}

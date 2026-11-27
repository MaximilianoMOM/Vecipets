import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('aliados_mapa')
export class AliadoMapa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  tipo: 'veterinaria' | 'refugio';

  @Column()
  nombre: string;

  @Column()
  direccion: string;

  @Column()
  municipio: string;

  @Column({ type: 'double precision' })
  latitud: number;

  @Column({ type: 'double precision' })
  longitud: number;

  @Column({ type: 'text', nullable: true })
  contacto: string | null;

  @Column({ type: 'text', nullable: true })
  horarios: string | null;

  @Column({ type: 'text', nullable: true })
  servicios: string | null;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ default: false })
  publicado: boolean;
}

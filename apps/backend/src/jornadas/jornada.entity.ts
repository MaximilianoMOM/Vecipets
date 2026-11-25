import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

@Entity('jornadas')
export class Jornada {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'organizador_id', type: 'int' })
  organizadorId: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizador_id' })
  organizador: Usuario;

  @Column({ type: 'varchar', length: 120 })
  titulo: string;

  @Column({ type: 'varchar' })
  veterinaria: string;

  @Column({ type: 'varchar' })
  comuna: string;

  @Column({ type: 'varchar', length: 160 })
  direccion: string;

  @Column({ name: 'fecha_inicio', type: 'timestamptz' })
  inicio: Date;

  @Column({ name: 'fecha_fin', type: 'timestamptz' })
  fin: Date;

  @Column({ name: 'fecha_texto', type: 'varchar' })
  fechaTexto: string;

  @Column({ name: 'hora_texto', type: 'varchar' })
  horaTexto: string;

  @Column({ name: 'cupos_totales', type: 'int' })
  cuposTotales: number;

  @Column({ name: 'cupos_disponibles', type: 'int' })
  cuposDisponibles: number;

  @Column({ name: 'precio_procedimiento_centavos', type: 'int' })
  precioCentavos: number;

  @Column({ name: 'precio_apartado_centavos', type: 'int' })
  precioApartadoCentavos: number;

  @Column({ type: 'boolean', default: true })
  activa: boolean;
}

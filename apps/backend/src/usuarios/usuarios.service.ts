
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  async obtenerTodos(): Promise<Usuario[]> {
    return this.usuariosRepository.find();
  }

  async obtenerPorId(id: number): Promise<Usuario | null> {
    return this.usuariosRepository.findOneBy({ id });
  }

  async crear(datos: Partial<Usuario>): Promise<Usuario> {
    const usuario = this.usuariosRepository.create(datos);
    return this.usuariosRepository.save(usuario);
  }

  async eliminar(id: number): Promise<void> {
    await this.usuariosRepository.delete(id);
  }
}


import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'node:crypto';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './usuario.entity';
import { CorreoService } from './correo.service';

describe('UsuariosService', () => {
  let service: UsuariosService;
  const usuarios = { update: vi.fn(), findOneBy: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: usuarios,
        },
        {
          provide: CorreoService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('solo toma decisiones sobre solicitudes pendientes de aliados', async () => {
    usuarios.update.mockResolvedValueOnce({ affected: 1 }).mockResolvedValueOnce({ affected: 0 });
    usuarios.findOneBy.mockResolvedValue({ id: 9, rol: 'CIUDADANO', estadoAprobacion: 'APROBADO' });
    await expect(service.moderarAliado(8, 'APROBADO')).resolves.toMatchObject({ estadoAprobacion: 'APROBADO' });
    expect(usuarios.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 8, estadoAprobacion: 'PENDIENTE' }),
      { estadoAprobacion: 'APROBADO' },
    );
    await expect(service.moderarAliado(9, 'RECHAZADO')).rejects.toThrow('La cuenta no corresponde a un aliado.');
  });

  it.each([
    ['REFUGIO', 'PENDIENTE'],
    ['VETERINARIA', 'PENDIENTE'],
    ['CIUDADANO', 'APROBADO'],
    ['VETERINARIA', 'APROBADO'],
  ])('devuelve el estado de %s (%s) al validar su código', async (rol, estadoAprobacion) => {
    const codigo = '123456';
    usuarios.findOneBy.mockResolvedValue({
      id: 8,
      rol,
      estadoAprobacion,
      correoVerificado: false,
      codigoVerificacionHash: createHash('sha256').update(codigo).digest('hex'),
      codigoVerificacionExpira: new Date(Date.now() + 60_000),
      intentosVerificacion: 0,
    });

    await expect(service.verificarCorreo('cuenta@example.test', codigo)).resolves.toEqual({
      mensaje: 'Correo verificado correctamente.',
      estadoAprobacion,
    });
    expect(usuarios.update).toHaveBeenCalledWith(8, {
      correoVerificado: true,
      codigoVerificacionHash: null,
      codigoVerificacionExpira: null,
      intentosVerificacion: 0,
    });
  });

  it('solo devuelve el mensaje si el correo ya estaba verificado', async () => {
    usuarios.findOneBy.mockResolvedValue({ correoVerificado: true, estadoAprobacion: 'PENDIENTE' });

    await expect(service.verificarCorreo('cuenta@example.test', '123456')).resolves.toEqual({
      mensaje: 'El correo ya está verificado.',
    });
    expect(usuarios.update).not.toHaveBeenCalled();
  });
});

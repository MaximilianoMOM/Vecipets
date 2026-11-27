
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ReportesService } from './reportes.service';

import {
  Reporte,
  TipoReporte,
  EstadoAprobacionReporte,
  EstadoReporte,
} from './reporte.entity';

import { Usuario } from '../usuarios/usuario.entity';
import { ValidacionImagenesService } from '../validacion-imagenes/validacion-imagenes.service';
import { AlmacenamientoService } from './almacenamiento.service';
import { PagosService } from '../pagos/pagos.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

describe('ReportesService', () => {
  let service: ReportesService;

  const mockReporteRepo = {
    create: vi.fn((dto: any) => ({
      ...dto,
      id: 1,
      creadoEn: new Date(),
    })),
    save: vi.fn((reporte: any) =>
      Promise.resolve({
        ...reporte,
        id: 1,
        creadoEn: new Date(),
      }),
    ),
    find: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    createQueryBuilder: vi.fn(),
  };

  const mockUsuarioRepo = {
    findOne: vi.fn(),
  };

  const mockValidacionImagenesService = {
    validarImagenReporte: vi.fn(),
  };

  const mockAlmacenamientoService = {
    guardarImagen: vi.fn(),
    validarBuffer: vi.fn(),
  };

  const mockUsuarioCiudadano = {
    id: 10,
    nombre: 'Carlos Perez',
    correo: 'carlos@ejemplo.com',
    rol: 'CIUDADANO',
    correoVerificado: true,
    estadoAprobacion: 'APROBADO',
  };

  const mockDto = {
    tipo: TipoReporte.PERDIDA,
    nombre: 'Firulais',
    especie: 'Perro',
    raza: 'Criollo',
    descripcion: 'Se perdió en el parque',
    fechaEvento: '2026-11-22',
    barrioSector: 'Laureles',
  };

  const mockArchivo = {
    originalname: 'perro.jpg',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('mock-image-data'),
  };

  it('omite el contacto del tutor en las respuestas p?blicas y lo conserva para el propietario y administraci?n', async () => {
    const reporte = {
      ...mockDto,
      id: 1,
      creadoEn: new Date(),
      estado: EstadoReporte.PUBLICO,
      estadoAprobacion: EstadoAprobacionReporte.APROBADO,
      usuario: mockUsuarioCiudadano,
    };
    mockReporteRepo.find.mockResolvedValueOnce([reporte]);
    mockReporteRepo.findOne.mockResolvedValue(reporte);

    const lista = await service.obtenerPublicos({});
    expect(lista.datos[0].usuario).toEqual({ id: mockUsuarioCiudadano.id });
    expect((await service.obtenerPorId(1)).usuario).toEqual({ id: mockUsuarioCiudadano.id });
    expect((await service.obtenerPorId(1, 999)).usuario).toEqual({ id: mockUsuarioCiudadano.id });
    expect((await service.obtenerPorId(1, mockUsuarioCiudadano.id)).usuario).toEqual({
      id: mockUsuarioCiudadano.id,
      nombre: mockUsuarioCiudadano.nombre,
      correo: mockUsuarioCiudadano.correo,
    });
    expect((await service.obtenerPorId(1, 999, true)).usuario).toHaveProperty(
      'correo', mockUsuarioCiudadano.correo,
    );
  });

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportesService,
        {
          provide: getRepositoryToken(Reporte),
          useValue: mockReporteRepo,
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepo,
        },
        {
          provide: ValidacionImagenesService,
          useValue: mockValidacionImagenesService,
        },
        {
          provide: AlmacenamientoService,
          useValue: mockAlmacenamientoService,
        },
        {
          provide: PagosService,
          useValue: {
            crearPagoAlertaTurbo: vi.fn(),
            consultarPagoPorReporte: vi.fn(),
          },
        },
        {
          provide: NotificacionesService,
          useValue: {
            crearNotificacion: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReportesService>(ReportesService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('guarda las coordenadas ajustadas al enviar un borrador que le pertenece al ciudadano', async () => {
    mockReporteRepo.findOne.mockResolvedValue({
      id: 1, usuario: mockUsuarioCiudadano, enviadoRevision: false,
      estado: EstadoReporte.PENDIENTE, estadoAprobacion: EstadoAprobacionReporte.PENDIENTE,
      latitud: '6.2442', longitud: '-75.5812',
    });
    const posicion = { latitud: '6.2506', longitud: '-75.5928' };
    const respuesta = await service.publicarBorrador(1, mockUsuarioCiudadano.id, posicion);
    expect(mockReporteRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      ...posicion, enviadoRevision: true,
    }));
    expect(respuesta.reporte).toMatchObject(posicion);
  });

  it('solo permite al dueño resolver un reporte aprobado', async () => {
    mockReporteRepo.findOne.mockResolvedValue({
      id: 1, usuario: { ...mockUsuarioCiudadano, passwordHash: 'privado' },
      estado: EstadoReporte.PUBLICO, estadoAprobacion: EstadoAprobacionReporte.APROBADO,
      enviadoRevision: true,
    });
    mockReporteRepo.update.mockResolvedValue({ affected: 1 });

    const cambios = { estado: EstadoReporte.RESUELTO };
    await expect(service.actualizar(1, cambios, 11)).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.actualizar(1, cambios, 11, true)).rejects.toBeInstanceOf(ForbiddenException);
    const solucionado = await service.actualizar(1, cambios, 10);
    expect(solucionado.estado).toBe(EstadoReporte.RESUELTO);
    expect(solucionado.usuario).not.toHaveProperty('passwordHash');
    expect(mockReporteRepo.update).toHaveBeenCalledTimes(1);
  });

  it('excluye de la aprobación los borradores y los reportes ya cerrados', async () => {
    const decision = { estadoAprobacion: EstadoAprobacionReporte.APROBADO };
    mockReporteRepo.findOne.mockResolvedValueOnce({
      id: 1, usuario: mockUsuarioCiudadano, enviadoRevision: false,
      estado: EstadoReporte.PENDIENTE, estadoAprobacion: EstadoAprobacionReporte.PENDIENTE,
    }).mockResolvedValueOnce({
      id: 1, usuario: mockUsuarioCiudadano, enviadoRevision: true,
      estado: EstadoReporte.CERRADO, estadoAprobacion: EstadoAprobacionReporte.APROBADO,
    });
    await expect(service.actualizar(1, decision, 11, true)).rejects.toBeInstanceOf(ConflictException);
    await expect(service.actualizar(1, decision, 11, true)).rejects.toBeInstanceOf(ConflictException);
    expect(mockReporteRepo.update).not.toHaveBeenCalled();
  });

  describe('crear reporte con validación de imagen', () => {
    beforeEach(() => {
      mockUsuarioRepo.findOne.mockResolvedValue(mockUsuarioCiudadano);

      mockAlmacenamientoService.guardarImagen.mockResolvedValue(
        '/uploads/reportes/perro.jpg',
      );
    });

    it('deja pendiente el reporte hasta la revisión humana aunque la imagen sea válida', async () => {
      mockValidacionImagenesService.validarImagenReporte.mockResolvedValue({
        estado: 'APROBADA',
        aprobada: true,
        esInapropiada: false,
        esDudosa: false,
        errorServicio: false,
        motivo: 'Animal detectado',
      });

      const resultado = await service.crear(mockDto, 10, mockArchivo);

      expect(resultado.validacion.estadoAprobacion).toBe(
        EstadoAprobacionReporte.PENDIENTE,
      );

      expect(resultado.validacion.estadoReporte).toBe(
        EstadoReporte.PENDIENTE,
      );

      expect(mockReporteRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          estadoAprobacion: EstadoAprobacionReporte.PENDIENTE,
          estado: EstadoReporte.PENDIENTE,
          imagenUrl: '/uploads/reportes/perro.jpg',
        }),
      );
    });

    it('debe dejar pendiente un reporte cuando la imagen es dudosa', async () => {
      mockValidacionImagenesService.validarImagenReporte.mockResolvedValue({
        estado: 'DUDOSA',
        aprobada: false,
        esInapropiada: false,
        esDudosa: true,
        errorServicio: false,
        motivo: 'No se detectaron indicios claros de mascota',
      });

      const resultado = await service.crear(mockDto, 10, mockArchivo);

      expect(resultado.validacion.estadoAprobacion).toBe(
        EstadoAprobacionReporte.PENDIENTE,
      );

      expect(resultado.validacion.estadoReporte).toBe(
        EstadoReporte.PENDIENTE,
      );
    });

    it('debe dejar pendiente el reporte si Roboflow falla', async () => {
      mockValidacionImagenesService.validarImagenReporte.mockResolvedValue({
        estado: 'DUDOSA',
        aprobada: false,
        esInapropiada: false,
        esDudosa: true,
        errorServicio: true,
        motivo: 'No fue posible conectar con Roboflow',
      });

      const resultado = await service.crear(mockDto, 10, mockArchivo);

      expect(resultado.validacion.estadoAprobacion).toBe(
        EstadoAprobacionReporte.PENDIENTE,
      );

      expect(resultado.validacion.estadoReporte).toBe(
        EstadoReporte.PENDIENTE,
      );
    });
  });

  describe('permisos para crear reportes', () => {
    it('debe rechazar a un usuario que no existe', async () => {
      mockUsuarioRepo.findOne.mockResolvedValue(null);

      await expect(service.crear(mockDto, 10, mockArchivo)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe rechazar a un usuario que no es ciudadano', async () => {
      mockUsuarioRepo.findOne.mockResolvedValue({
        ...mockUsuarioCiudadano,
        rol: 'REFUGIO',
      });

      await expect(service.crear(mockDto, 10, mockArchivo)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('debe rechazar a un ciudadano que no verificó su correo', async () => {
      mockUsuarioRepo.findOne.mockResolvedValue({
        ...mockUsuarioCiudadano,
        correoVerificado: false,
      });

      await expect(service.crear(mockDto, 10, mockArchivo)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});

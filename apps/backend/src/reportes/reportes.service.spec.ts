
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
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
      ],
    }).compile();

    service = module.get<ReportesService>(ReportesService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('crear reporte con validación de imagen', () => {
    beforeEach(() => {
      mockUsuarioRepo.findOne.mockResolvedValue(mockUsuarioCiudadano);

      mockAlmacenamientoService.guardarImagen.mockResolvedValue(
        '/uploads/reportes/perro.jpg',
      );
    });

    it('debe publicar automáticamente cuando Roboflow aprueba la imagen', async () => {
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
        EstadoAprobacionReporte.APROBADO,
      );

      expect(resultado.validacion.estadoReporte).toBe(
        EstadoReporte.PUBLICO,
      );

      expect(mockReporteRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          estadoAprobacion: EstadoAprobacionReporte.APROBADO,
          estado: EstadoReporte.PUBLICO,
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

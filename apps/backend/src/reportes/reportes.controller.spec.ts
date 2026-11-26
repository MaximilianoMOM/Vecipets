import { Test, TestingModule } from '@nestjs/testing';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';

describe('ReportesController', () => {
  let controller: ReportesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportesController],
      providers: [
        {
          provide: ReportesService,
          useValue: {
            crear: vi.fn(),
            obtenerTodos: vi.fn(),
            obtenerPorId: vi.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: vi.fn(),
            sign: vi.fn(),
          },
        },
        {
          provide: UsuariosService,
          useValue: {
            obtenerPorId: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ReportesController>(ReportesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

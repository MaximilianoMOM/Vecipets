import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('debe devolver la información de VeciPets', () => {
    expect(controller.inicio()).toEqual({
      mensaje: '¡Bienvenido a VeciPets!',
      estado: 'Backend funcionando correctamente',
      servicio: 'API VeciPets',
      version: '1.0.0',
    });
  });
});

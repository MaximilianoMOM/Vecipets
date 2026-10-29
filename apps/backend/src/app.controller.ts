
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  inicio() {
    return {
      mensaje: '¡Bienvenido a VeciPets!',
      estado: 'Backend funcionando correctamente',
      servicio: 'API VeciPets',
      version: '1.0.0',
    };
  }
}

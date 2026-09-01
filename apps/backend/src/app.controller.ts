import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getApiStatus() {
    return {
      message: 'API VeciPets funcionando correctamente',
      version: 'v1',
      status: 'ok',
    };
  }

  getHello() {
    return 'API VeciPets funcionando correctamente';
  }
}
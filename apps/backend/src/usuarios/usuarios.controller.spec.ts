import type { Response as ExpressResponse } from 'express';
import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

describe('UsuariosController', () => {
  let controller: UsuariosController;

  const login = vi.fn();
  const crear = vi.fn();
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.clearAllMocks(); });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [
        {
          provide: UsuariosService,
          useValue: { login, crear },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsuariosController>(UsuariosController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  const datosLogin = { correo: 'vecino@example.test', password: 'Password123', recaptchaToken: 'token-local' };
  function responderGoogle(respuesta: object) {
    const fetchGoogle = vi.fn().mockResolvedValue(Response.json(respuesta));
    vi.stubGlobal('fetch', fetchGoogle);
    return fetchGoogle;
  }

  it('acepta un token v2 válido con la clave exclusiva de login', async () => {
    vi.stubEnv('RECAPTCHA_V2_SECRET_KEY', 'secreto-v2-de-prueba');
    const fetchGoogle = responderGoogle({ success: true });
    const respuesta = {} as ExpressResponse;
    await controller.login(datosLogin, respuesta);
    expect(fetchGoogle.mock.calls[0][1].body.get('secret')).toBe('secreto-v2-de-prueba');
    expect(login).toHaveBeenCalledWith({ correo: datosLogin.correo, password: datosLogin.password }, respuesta);
  });

  it.each([
    ['invalid-input-response', 'No se pudo verificar reCAPTCHA. Intenta nuevamente.'],
    ['timeout-or-duplicate', 'La verificación reCAPTCHA venció o ya se usó. Marca la casilla nuevamente.'],
  ])('rechaza el token %s antes de evaluar las credenciales', async (codigo, mensaje) => {
    vi.stubEnv('RECAPTCHA_V2_SECRET_KEY', 'secreto-v2-de-prueba');
    responderGoogle({ success: false, 'error-codes': [codigo] });
    await expect(controller.login(datosLogin, {} as ExpressResponse)).rejects.toThrow(mensaje);
    expect(login).not.toHaveBeenCalled();
  });

  it('mantiene la acción y el puntaje de reCAPTCHA v3 para registro', async () => {
    vi.stubEnv('RECAPTCHA_SECRET_KEY', 'secreto-v3-de-prueba');
    const datos = { ...datosLogin, nombre: 'Vecino', rol: 'CIUDADANO' as const };
    responderGoogle({ success: true, action: 'login', score: 0.9 });
    await expect(controller.crear(datos)).rejects.toThrow('No se pudo verificar reCAPTCHA');
    responderGoogle({ success: true, action: 'register', score: 0.4 });
    await expect(controller.crear(datos)).rejects.toThrow('No se pudo verificar reCAPTCHA');
    const fetchGoogle = responderGoogle({ success: true, action: 'register', score: 0.9 });
    await controller.crear(datos);
    expect(fetchGoogle.mock.calls[0][1].body.get('secret')).toBe('secreto-v3-de-prueba');
    expect(crear).toHaveBeenCalledTimes(1);
  });
});
